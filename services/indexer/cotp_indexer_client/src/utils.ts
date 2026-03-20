export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function toHexString(num: number | bigint): string {
  return `0x${num.toString(16)}`;
} 