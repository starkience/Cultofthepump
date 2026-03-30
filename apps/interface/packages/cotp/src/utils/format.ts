/**
 * Formats a raw chain amount (18-decimal wei string) as a human-readable value.
 * e.g. "1000000000000000000" → "1"
 *      "100000000000000000" → "0.1"
 *      "10000000000"        → "<0.0001"
 */
export function formatWei(rawWei: string | bigint, decimals = 18): string {
  if (rawWei === '' || rawWei === null || rawWei === undefined) return '0'
  try {
    const n = typeof rawWei === 'bigint' ? rawWei : BigInt(rawWei)
    if (n === BigInt(0)) return '0'

    // Safe for amounts up to ~9 quadrillion tokens
    const value = Number(n) / Math.pow(10, decimals)

    if (value < 0.01) return '<0.01'
    if (value < 1) return value.toFixed(2)
    return value.toLocaleString('en', { maximumFractionDigits: 2, minimumFractionDigits: 2 })
  } catch {
    return rawWei.toString()
  }
}

/** Formats a raw wei amount as "X STRK" */
export function formatStrk(rawWei: string | bigint): string {
  return `${formatWei(rawWei)} STRK`
}

/**
 * Formats a price (STRK per token, already a float) for display.
 * Uses scientific notation for very small values common in memecoins.
 */
export function formatPrice(price: number): string {
  if (price === 0) return '0'
  if (price >= 1) return price.toLocaleString('en', { maximumFractionDigits: 6 })
  if (price >= 0.000001) return price.toFixed(8).replace(/0+$/, '')
  // Very small — use scientific notation
  return price.toExponential(4)
}

/**
 * Computes STRK/token price from raw 18-decimal wei strings.
 * Returns 0 if token_qty is zero.
 */
export function computePrice(strkQtyWei: string, tokenQtyWei: string): number {
  try {
    const strk = BigInt(strkQtyWei)
    const tokens = BigInt(tokenQtyWei)
    if (tokens === 0n) return 0
    // Both are 1e18 scaled — dividing gives raw ratio, which is already STRK/token
    return Number(strk) / Number(tokens)
  } catch {
    return 0
  }
}

/**
 * Formats a raw market cap (18-decimal STRK wei) as a compact human label.
 * e.g. "9900000000000000000" → "9.9 STRK"
 */
export function formatMarketCap(rawWei: string): string {
  try {
    const value = Number(BigInt(rawWei)) / 1e18
    if (value === 0) return '0 STRK'
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M STRK`
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K STRK`
    return `${value.toFixed(2)} STRK`
  } catch {
    return '0 STRK'
  }
}
