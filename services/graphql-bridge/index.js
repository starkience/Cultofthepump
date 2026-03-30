// Hasura-compatible GraphQL bridge over local Postgres (DipDup schema)
const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')

const pool = new Pool({
  user: process.env.DB_USER || 'dipdup',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'dipdup',
  password: process.env.DB_PASSWORD || 'dipdup',
  port: parseInt(process.env.DB_PORT || '5432'),
})

const app = express()
app.use(cors())
app.use(express.json())

function normalizeAddress(addr) {
  if (!addr) return null
  const hex = addr.replace(/^0x/i, '').replace(/^0+/, '') || '0'
  return '0x' + hex.toLowerCase()
}

const GRADUATION_THRESHOLD_WEI = BigInt('101010') * BigInt('1000000000000000000')

const blockTimestampCache = new Map()
async function getBlockTimestamp(blockNumber) {
  if (blockTimestampCache.has(blockNumber)) return blockTimestampCache.get(blockNumber)
  try {
    const response = await fetch(
      process.env.STARKNET_RPC || 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_7/YOUR_KEY',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'starknet_getBlockWithTxHashes', params: [{ block_number: blockNumber }], id: 1 }),
      }
    )
    const data = await response.json()
    const ts = data?.result?.timestamp || null
    if (ts) blockTimestampCache.set(blockNumber, ts)
    return ts
  } catch { return null }
}

app.post('/v1/graphql', async (req, res) => {
  const { query = '', variables = {} } = req.body

  try {
    let result

    // ── CultCandles ──────────────────────────────────────────────────────────
    if (query.includes('CultCandles')) {
      const tokenId = variables.tokenId
      const bucketSeconds = variables.bucketSeconds || 300

      const { rows } = await pool.query(`
        SELECT block_number, side, token_qty::text AS token_qty, strk_qty::text AS strk_qty, market_cap::text AS market_cap
        FROM trade WHERE token_id = $1::numeric ORDER BY id ASC
      `, [tokenId])

      const uniqueBlocks = [...new Set(rows.map(r => r.block_number))]
      await Promise.all(uniqueBlocks.map(getBlockTimestamp))
      const firstBlock = uniqueBlocks[0] || 0
      const refTs = blockTimestampCache.get(firstBlock) || Math.floor(Date.now() / 1000)

      const candleMap = new Map()
      for (const row of rows) {
        const ts = blockTimestampCache.get(row.block_number) || (refTs + (row.block_number - firstBlock) * 30)
        const bucketTs = Math.floor(ts / bucketSeconds) * bucketSeconds
        const tokenQty = BigInt(row.token_qty)
        const strkQty = BigInt(row.strk_qty)
        const price = tokenQty === 0n ? 0 : Number(strkQty) / Number(tokenQty)
        if (!candleMap.has(bucketTs)) {
          candleMap.set(bucketTs, { time: bucketTs, open: price, high: price, low: price, close: price, volume: 0 })
        } else {
          const c = candleMap.get(bucketTs)
          c.high = Math.max(c.high, price)
          c.low = Math.min(c.low, price)
          c.close = price
          c.volume += Number(row.strk_qty)
        }
      }
      result = { data: { candle: Array.from(candleMap.values()).sort((a, b) => a.time - b.time) } }

    // ── CultTokenMetrics ─────────────────────────────────────────────────────
    } else if (query.includes('CultTokenMetrics')) {
      const address = normalizeAddress(variables.address)
      const { rows } = await pool.query(`
        SELECT
          t.id::text AS id, t.contract_address AS "contractAddress", t.graduated,
          COALESCE(latest.market_cap::text, '0') AS "currentMarketCap",
          COALESCE(latest.strk_qty::text, '0')   AS "lastTradeStrk",
          COALESCE(latest.token_qty::text, '0')  AS "lastTradeTokens",
          COALESCE(vol.total_volume::text, '0')  AS "totalVolume",
          COALESCE(vol.trade_count, 0)           AS "tradeCount",
          COALESCE(bel.believer_count, 0)        AS "believerCount"
        FROM token t
        LEFT JOIN LATERAL (
          SELECT market_cap, strk_qty, token_qty FROM trade WHERE trade.token_id = t.id ORDER BY id DESC LIMIT 1
        ) latest ON true
        LEFT JOIN LATERAL (
          SELECT SUM(strk_qty) AS total_volume, COUNT(*) AS trade_count FROM trade WHERE trade.token_id = t.id
        ) vol ON true
        LEFT JOIN LATERAL (
          SELECT COUNT(DISTINCT trader_id) AS believer_count FROM trade WHERE trade.token_id = t.id
        ) bel ON true
        WHERE LOWER(REGEXP_REPLACE(t.contract_address, '^0x0+', '0x', 'i')) = $1
        LIMIT 1
      `, [address])
      result = { data: { tokenMetrics: rows[0] || null } }

    // ── CultBelievers ────────────────────────────────────────────────────────
    } else if (query.includes('CultBelievers')) {
      const tokenId = variables.tokenId
      const { rows } = await pool.query(`
        SELECT
          COUNT(DISTINCT trader_id)::int AS "believerCount",
          (SELECT trader_id::text FROM trade WHERE token_id = $1::numeric ORDER BY id ASC LIMIT 1) AS "firstBeliever"
        FROM trade WHERE token_id = $1::numeric
      `, [tokenId])
      result = { data: { believers: rows[0] || { believerCount: 0, firstBeliever: null } } }

    // ── CultGlobalFeed ───────────────────────────────────────────────────────
    } else if (query.includes('CultGlobalFeed')) {
      const limit = variables.limit || 50
      const { rows } = await pool.query(`
        SELECT
          tr.id::text                                                    AS id,
          tr.side                                                        AS side,
          tr.kind                                                        AS kind,
          tr.token_qty::text                                             AS "tokenQty",
          tr.strk_qty::text                                              AS "strkQty",
          tr.market_cap::text                                            AS "marketCap",
          tr.block_number                                                AS "blockNumber",
          tr.trader_id::text                                             AS "traderId",
          EXTRACT(EPOCH FROM tr.timestamp)::bigint * 1000               AS "timestampMs",
          tok.name                                                       AS "tokenName",
          tok.symbol                                                     AS "tokenSymbol",
          tok.contract_address                                           AS "tokenAddress",
          tok.graduated                                                  AS "tokenGraduated"
        FROM trade tr
        JOIN token tok ON tr.token_id = tok.id
        ORDER BY tr.id DESC
        LIMIT $1
      `, [limit])
      result = { data: { globalFeed: rows } }

    // ── CultEnergy ───────────────────────────────────────────────────────────
    } else if (query.includes('CultEnergy')) {
      // Energy = recent trade activity score (0-100)
      // Use last 200 trades as the window; score = min(count, 100)
      const { rows } = await pool.query(`
        SELECT
          COUNT(*)::int                         AS "recentTrades",
          COUNT(DISTINCT token_id)::int         AS "activeCults",
          COALESCE(SUM(strk_qty)::text, '0')   AS "totalVolume",
          COUNT(DISTINCT trader_id)::int        AS "uniqueBelievers"
        FROM (SELECT token_id, strk_qty, trader_id FROM trade ORDER BY id DESC LIMIT 200) recent
      `)
      const r = rows[0]
      const energy = Math.min(100, Math.round((r.recentTrades / 200) * 100))
      result = { data: { energy: { ...r, score: energy } } }

    // ── CultTrades ───────────────────────────────────────────────────────────
    } else if (query.includes('CultTrades')) {
      const tokenId = variables.tokenId
      const limit = variables.limit || 20
      const { rows } = await pool.query(`
        SELECT
          id::text AS id, side, kind,
          token_qty::text AS "tokenQty", strk_qty::text AS "strkQty",
          market_cap::text AS "marketCap", block_number AS "blockNumber",
          trader_id::text AS "traderId"
        FROM trade
        WHERE ($1::numeric IS NULL OR token_id = $1::numeric)
        ORDER BY id DESC LIMIT $2
      `, [tokenId || null, limit])
      result = { data: { trade: rows } }

    // ── CultTokens (default) ─────────────────────────────────────────────────
    } else {
      const address = normalizeAddress(variables.address)
      const createdBy = normalizeAddress(variables.createdBy)
      const limit = variables.limit || 48
      const orderBy = variables.orderBy || 'newest'

      let orderClause
      switch (orderBy) {
        case 'volume':     orderClause = 'trade_count DESC NULLS LAST, t.id DESC'; break
        case 'graduation': orderClause = 'latest_market_cap DESC NULLS LAST, t.id DESC'; break
        case 'believers':  orderClause = 'believer_count DESC NULLS LAST, t.id DESC'; break
        default:           orderClause = 't.id DESC'
      }

      const { rows } = await pool.query(`
        SELECT
          t.id::text AS id, t.name, t.symbol,
          t.contract_address AS "contractAddress", t.created_by AS "createdBy",
          t.initial_supply::text AS "initialSupply", t.initial_price::text AS "initialPrice",
          t.launch_fee::text AS "launchFee", t.num_holders AS "numHolders",
          t.graduated AS graduated,
          COALESCE(vol.trade_count, 0)             AS "tradeCount",
          COALESCE(vol.trade_count, 0)             AS believer_count,
          COALESCE(bel.believer_count, 0)          AS "believerCount",
          COALESCE(latest.market_cap::text, '0')   AS "currentMarketCap",
          COALESCE(vol.total_volume::text, '0')    AS "totalVolume",
          GREATEST(1, COALESCE(
            EXTRACT(EPOCH FROM (NOW() - vol.first_trade_ts)) / 86400.0,
            1
          ))::float                                AS "ageDays"
        FROM token t
        LEFT JOIN LATERAL (
          SELECT COUNT(*) AS trade_count,
                 SUM(strk_qty) AS total_volume,
                 MIN(timestamp) AS first_trade_ts
          FROM trade WHERE trade.token_id = t.id
        ) vol ON true
        LEFT JOIN LATERAL (SELECT COUNT(DISTINCT trader_id) AS believer_count FROM trade WHERE trade.token_id = t.id) bel ON true
        LEFT JOIN LATERAL (SELECT market_cap FROM trade WHERE trade.token_id = t.id ORDER BY id DESC LIMIT 1) latest ON true
        WHERE ($1::text IS NULL OR LOWER(REGEXP_REPLACE(t.contract_address, '^0x0+', '0x', 'i')) = $1)
          AND ($3::text IS NULL OR LOWER(REGEXP_REPLACE(t.created_by, '^0x0+', '0x', 'i')) = $3)
        ORDER BY ${orderClause}
        LIMIT $2
      `, [address, limit, createdBy])
      result = { data: { token: rows } }
    }

    res.json(result)
  } catch (err) {
    console.error('[bridge error]', err.message)
    const q = req.body.query || ''
    if (q.includes('CultCandles'))      res.json({ data: { candle: [] } })
    else if (q.includes('CultTokenMetrics')) res.json({ data: { tokenMetrics: null } })
    else if (q.includes('CultBelievers'))    res.json({ data: { believers: { believerCount: 0, firstBeliever: null } } })
    else if (q.includes('CultGlobalFeed'))   res.json({ data: { globalFeed: [] } })
    else if (q.includes('CultEnergy'))       res.json({ data: { energy: { score: 0, recentTrades: 0, activeCults: 0, totalVolume: '0', uniqueBelievers: 0 } } })
    else if (q.includes('CultTrades'))       res.json({ data: { trade: [] } })
    else res.json({ data: { token: [] } })
  }
})

app.get('/healthz', (_req, res) => res.json({ ok: true }))
const PORT = 42000
app.listen(PORT, () => console.log(`[graphql-bridge] listening on http://localhost:${PORT}/v1/graphql`))
