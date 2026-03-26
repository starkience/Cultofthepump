#!/usr/bin/env python3
"""Backfill missing trades by querying starknet_getEvents directly."""
import json, requests, psycopg2
from decimal import Decimal

RPC = "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_7/6e6ntRee9DYgQFYqVffLB"
SWAP = "0x07a6c0500a1596c0a501156ba660c84c461a599053ab96319d61dfc2626a45b9"

TOKEN_BOUGHT = "0x242149141199ec52571d7e7ef5cea0be9b9ca549cbb2af0f35e0f86d96b739e"
TOKEN_SOLD   = "0x155a433103a64d02cf5604e092cd2ea4a8acd5bac3ab9c209ba0b03ca05cb81"

conn = psycopg2.connect(host="localhost", dbname="dipdup", user="dipdup", password="dipdup")
cur = conn.cursor()

# Get highest indexed block
cur.execute("SELECT COALESCE(MAX(block_number), 0) FROM trade")
from_block = cur.fetchone()[0]
print(f"Last indexed block: {from_block}, fetching from {from_block + 1}...")

def rpc(method, params):
    r = requests.post(RPC, json={"jsonrpc":"2.0","method":method,"params":params,"id":1})
    return r.json().get("result")

def u256(low, high):
    return int(low, 16) + (int(high, 16) << 128)

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
        tx = ev["transaction_hash"]

        if keys[0] == TOKEN_BOUGHT:
            # data: buyer, strk_amount(u256), token_amount(u256), market_cap(u256), fee(u256)
            buyer     = int(keys[1], 16) if len(keys) > 1 else int(data[0], 16)
            token_id  = int(data[0] if len(keys) <= 1 else keys[1], 16)
            # layout: buyer, strk_lo, strk_hi, tok_lo, tok_hi, mcap_lo, mcap_hi, fee_lo, fee_hi
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
        """, (side, kind, Decimal(token_qty), Decimal(strk), Decimal(mcap), block, Decimal(token_id), Decimal(buyer)))
        inserted += 1

    continuation = result.get("continuation_token")
    if not continuation:
        break

conn.commit()
print(f"Done. Inserted {inserted} new trades.")
cur.close()
conn.close()
