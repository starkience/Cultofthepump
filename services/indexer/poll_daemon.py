#!/usr/bin/env python3
"""
Continuous trade-polling daemon.
Replaces one-shot backfill_trades.py — runs every 30 seconds,
picks up any trades the DipDup indexer missed (restarts, downtime, etc.)
"""

import sys, os
import json, time, logging, signal
import requests, psycopg2
from decimal import Decimal

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [poller] %(levelname)s %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
log = logging.getLogger("poller")

RPC  = "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_10/64DNr-i0S4FY1t0JMUJdq"
SWAP = "0x07a6c0500a1596c0a501156ba660c84c461a599053ab96319d61dfc2626a45b9"
FACTORY = "0x0135abb443cbba9738fe63d55a06810fdf14b605ddc5262220a889411baede25"

TOKEN_BOUGHT      = "0x242149141199ec52571d7e7ef5cea0be9b9ca549cbb2af0f35e0f86d96b739e"
TOKEN_SOLD        = "0x155a433103a64d02cf5604e092cd2ea4a8acd5bac3ab9c209ba0b03ca05cb81"
POOL_LAUNCHED     = "0x85d58db60cc63bbc218804978f5b9e5227b9aaa37bf3bde3a88fd0b060900b"
SHITCOIN_LAUNCHED = "0x13c55d5a688e68efda2ce06be4610294f379806ba89c405627c50579d9bf052"

POLL_INTERVAL = 30  # seconds

DB_PARAMS = dict(host="localhost", dbname="dipdup", user="dipdup", password="dipdup")

_running = True

def handle_signal(sig, frame):
    global _running
    log.info("Caught signal %s, shutting down...", sig)
    _running = False

signal.signal(signal.SIGTERM, handle_signal)
signal.signal(signal.SIGINT, handle_signal)


def rpc(method, params):
    try:
        r = requests.post(RPC, json={"jsonrpc": "2.0", "method": method, "params": params, "id": 1}, timeout=30)
        return r.json().get("result")
    except Exception as e:
        log.warning("RPC %s failed: %s", method, e)
        return None


def u256(low, high):
    return int(low, 16) + (int(high, 16) << 128)


def poll_trades(cur):
    """Fetch and insert any TokenBought/TokenSold events since the last indexed block."""
    cur.execute("SELECT COALESCE(MAX(block_number), 0) FROM trade")
    from_block = cur.fetchone()[0]

    inserted = 0
    continuation = None

    while True:
        params = [{
            "from_block": {"block_number": from_block + 1},
            "to_block": "latest",
            "address": SWAP,
            "chunk_size": 1000,
        }]
        if continuation:
            params[0]["continuation_token"] = continuation

        result = rpc("starknet_getEvents", params)
        if not result:
            break

        for ev in result.get("events", []):
            keys = ev["keys"]
            data = ev["data"]
            block = ev["block_number"]

            if keys[0] == TOKEN_BOUGHT:
                buyer     = int(data[0], 16)
                strk      = u256(data[1], data[2])
                token_qty = u256(data[3], data[4])
                mcap      = u256(data[5], data[6])
                token_id  = int(keys[1], 16)
                side, kind = 0, 0
            elif keys[0] == TOKEN_SOLD:
                buyer     = int(data[0], 16)
                strk      = u256(data[1], data[2])
                token_qty = u256(data[3], data[4])
                mcap      = u256(data[5], data[6])
                token_id  = int(keys[1], 16)
                side, kind = 1, 0
            else:
                continue

            cur.execute("""
                INSERT INTO trade (side, kind, token_qty, strk_qty, market_cap, block_number, token_id, trader_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
            """, (side, kind, Decimal(token_qty), Decimal(strk), Decimal(mcap), block,
                  Decimal(token_id), Decimal(buyer)))
            inserted += 1

        continuation = result.get("continuation_token")
        if not continuation:
            break

    return inserted


def decode_bytearray(felts, offset):
    """Decode one Cairo ByteArray starting at felts[offset]. Returns (string, next_offset)."""
    num_words = int(felts[offset], 16)
    words = [felts[offset + 1 + i] for i in range(num_words)]
    pending_word = felts[offset + 1 + num_words]
    pending_len  = int(felts[offset + 2 + num_words], 16)
    result = ''
    for w in words:
        result += bytes.fromhex(w[2:].zfill(62)).decode('ascii', errors='replace')
    if pending_len > 0:
        result += bytes.fromhex(pending_word[2:].zfill(pending_len * 2)).decode('ascii', errors='replace')
    return result, offset + 3 + num_words


def decode_bytearray_pair(felts):
    """Decode two consecutive ByteArrays (name, symbol) from a felt list."""
    try:
        name,   off = decode_bytearray(felts, 0)
        symbol, _   = decode_bytearray(felts, off)
        return name.strip(), symbol.strip()
    except Exception:
        return '?', '?'


def poll_launches(cur):
    """Fetch and insert any ShitcoinLaunched events since the last indexed token."""
    # Check if block_number_created exists in the schema
    cur.execute("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name='token' AND column_name='block_number_created'
    """)
    has_block_col = cur.fetchone() is not None

    if has_block_col:
        cur.execute("SELECT COALESCE(MAX(block_number_created), 0) FROM token")
        row = cur.fetchone()
        from_block = row[0] if row else 0
    else:
        # No block column — use the highest trade block as a proxy (launches precede trades).
        # Scan all factory events with ON CONFLICT DO NOTHING to safely catch any gaps.
        cur.execute("SELECT COALESCE(MAX(block_number), 0) FROM trade")
        row = cur.fetchone()
        from_block = max(0, (row[0] or 0) - 500)  # look back 500 blocks to avoid gaps
    inserted = 0
    continuation = None

    while True:
        params = [{
            "from_block": {"block_number": from_block + 1},
            "to_block": "latest",
            "address": FACTORY,
            "chunk_size": 500,
        }]
        if continuation:
            params[0]["continuation_token"] = continuation

        result = rpc("starknet_getEvents", params)
        if not result:
            break

        for ev in result.get("events", []):
            keys = ev["keys"]
            data = ev["data"]

            if keys[0] != SHITCOIN_LAUNCHED:
                continue

            # Event data layout:
            #   data[0] = shitcoin contract address
            #   data[1] = creator address
            #   data[2..] = name ByteArray (num_words, [...words], pending_word, pending_len)
            #             = symbol ByteArray
            #             = initial_sniping u256 (lo, hi)
            try:
                token_addr = int(data[0], 16)
                creator    = int(data[1], 16)
                name, symbol = decode_bytearray_pair(data[2:])
                cur.execute("""
                    INSERT INTO token (id, name, symbol, contract_address, created_by,
                                       initial_supply, initial_price, launch_fee, num_holders, graduated)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT DO NOTHING
                """, (
                    Decimal(token_addr), name, symbol,
                    hex(token_addr), hex(creator),
                    Decimal(0), Decimal(0), Decimal(0), 0, False
                ))
                if cur.rowcount > 0:
                    inserted += 1
                    log.info("New token launch: %s (%s) at %s", name, symbol, hex(token_addr))
            except Exception as e:
                log.debug("Skipping launch event parse error: %s", e)

        continuation = result.get("continuation_token")
        if not continuation:
            break

    return inserted


def poll_graduations(cur):
    """Mark tokens as graduated when a PoolLaunched event exists for them in the Swap contract."""
    # Find the highest block we've already checked for graduations
    cur.execute("""
        SELECT COALESCE(MAX(block_number), 0) FROM trade
        WHERE side = 0  -- approximate; we just need a reasonable from_block
    """)
    # Use last known trade block; PoolLaunched is emitted by Swap in the same block as the final buy
    cur.execute("SELECT COALESCE(MAX(block_number), 0) FROM trade")
    row = cur.fetchone()
    from_block = max(0, (row[0] or 0) - 100)  # look back 100 blocks to avoid missing edge cases

    updated = 0
    continuation = None

    while True:
        params = [{
            "from_block": {"block_number": from_block},
            "to_block": "latest",
            "address": SWAP,
            "chunk_size": 500,
        }]
        if continuation:
            params[0]["continuation_token"] = continuation

        result = rpc("starknet_getEvents", params)
        if not result:
            break

        for ev in result.get("events", []):
            keys = ev["keys"]
            if keys[0] != POOL_LAUNCHED:
                continue
            # keys: [selector, token]  (token is the graduated cult token)
            try:
                token_addr = hex(int(keys[1], 16))
                cur.execute(
                    "UPDATE token SET graduated = TRUE WHERE contract_address = %s AND graduated = FALSE",
                    (token_addr,)
                )
                if cur.rowcount > 0:
                    log.info("Graduated token %s", token_addr)
                    updated += 1
            except Exception as e:
                log.debug("Graduation parse error: %s", e)

        continuation = result.get("continuation_token")
        if not continuation:
            break

    return updated


def run_once():
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        cur = conn.cursor()
        trade_count = poll_trades(cur)
        launch_count = poll_launches(cur)
        grad_count = poll_graduations(cur)
        conn.commit()
        cur.close()
        conn.close()
        if trade_count > 0:
            log.info("Inserted %d new trades", trade_count)
        if launch_count > 0:
            log.info("Inserted %d new token launches", launch_count)
        if grad_count > 0:
            log.info("Marked %d tokens as graduated", grad_count)
    except Exception as e:
        log.error("Poll cycle failed: %s", e)


def main():
    log.info("Poll daemon starting (interval=%ds, swap=%s)", POLL_INTERVAL, SWAP)
    while _running:
        run_once()
        # Sleep in small increments so we respond to signals quickly
        for _ in range(POLL_INTERVAL * 10):
            if not _running:
                break
            time.sleep(0.1)

    log.info("Poll daemon stopped.")


if __name__ == "__main__":
    main()
