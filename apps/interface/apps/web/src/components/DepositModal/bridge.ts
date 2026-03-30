// ─── Token & bridge addresses ──────────────────────────────────────────────────
// CCTP v2 (Circle Cross-Chain Transfer Protocol) — native USDC bridging
// Ethereum Sepolia → Starknet Sepolia
//
// Mainnet addresses included for reference — swap when going live.

// ── Ethereum USDC ─────────────────────────────────────────────────────────────
export const USDC_ETH_MAINNET = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
export const USDC_ETH_SEPOLIA = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'

// ── Starknet USDC ─────────────────────────────────────────────────────────────
export const USDC_SN_MAINNET = '0x033068f6539f8e6e6b131e6b2b814e6c34a5224bc66947c47dab9dfee93b35fb'
export const USDC_SN_SEPOLIA = '0x0512feac6339ff7889822cb5aa2a86c848e9d392bb0e3e237c008674feed8343'

// ── CCTP v2 contracts ─────────────────────────────────────────────────────────
// Ethereum Sepolia
export const CCTP_TOKEN_MESSENGER_L1_SEPOLIA     = '0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA'
export const CCTP_MESSAGE_TRANSMITTER_L1_SEPOLIA = '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275'
// Starknet Sepolia
export const CCTP_TOKEN_MESSENGER_L2_SEPOLIA     = '0x04bDdE1E09a4B09a2F95d893D94a967b7717eB85A3f6dEcA8c080Ee01fBc3370'
export const CCTP_MESSAGE_TRANSMITTER_L2_SEPOLIA = '0x04db7926C64f1f32a840F3Fa95cB551f3801a3600Bae87aF87807A54DCE12Fe8'
export const CCTP_ETH_DOMAIN = 0
export const CCTP_SN_DOMAIN  = 25

// ── Active addresses (testnet) ────────────────────────────────────────────────
export const USDC_ETH           = USDC_ETH_SEPOLIA
export const USDC_SN            = USDC_SN_SEPOLIA
export const CCTP_MESSENGER_L1  = CCTP_TOKEN_MESSENGER_L1_SEPOLIA

// ── AVNU Paymaster ────────────────────────────────────────────────────────────
// Mainnet only — disabled on testnet (Sepolia gas is negligible anyway)
export const AVNU_API_KEY       = import.meta.env.VITE_AVNU_API_KEY as string ?? ''
export const AVNU_PAYMASTER_URL = 'https://paymaster.avnu.fi'
export const PAYMASTER_ENABLED  = false // flip to true when deploying to mainnet

// ── CCTP / ERC-20 function selectors ─────────────────────────────────────────
const BALANCE_OF     = '0x70a08231' // balanceOf(address)
const APPROVE        = '0x095ea7b3' // approve(address,uint256)
// depositForBurn(uint256,uint32,bytes32,address,bytes32,uint256,uint32)
const DEPOSIT_FOR_BURN = '0x8e0250ee'

// ── IRIS API (Circle attestation service) ────────────────────────────────────
const IRIS_API = 'https://iris-api-sandbox.circle.com'

// Public Ethereum Sepolia RPC — used for read-only calls so the balance
// is always fetched from Sepolia regardless of what chain the wallet is on.
const ETH_SEPOLIA_RPC      = 'https://ethereum-sepolia-rpc.publicnode.com'
const ETH_SEPOLIA_CHAIN_ID = '0xaa36a7' // 11155111

type EthProvider = { request: (args: { method: string; params: unknown[] }) => Promise<unknown> }

function getEthProvider(): EthProvider {
  const p = (window as unknown as { ethereum?: EthProvider }).ethereum
  if (!p) throw new Error('No Ethereum wallet detected. Make sure MetaMask or Phantom (EVM) is installed.')
  return p
}

// ─── Read Ethereum USDC balance (always via public Sepolia RPC) ───────────────
// Bypasses wallet chain — works even if the user's wallet is on mainnet.

export async function getEthUsdcBalance(ethAddress: string): Promise<bigint> {
  const paddedAddr = ethAddress.replace('0x', '').padStart(64, '0')
  const body = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_call',
    params: [{ to: USDC_ETH, data: `${BALANCE_OF}${paddedAddr}` }, 'latest'],
  })
  const res  = await fetch(ETH_SEPOLIA_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
  const json = await res.json() as { result?: string; error?: { message: string } }
  if (json.error) throw new Error(json.error.message)
  return BigInt(json.result ?? '0x0')
}

// ─── Ensure wallet is on Sepolia before sending a transaction ────────────────

async function ensureSepolia(provider: EthProvider): Promise<void> {
  const chainId = await provider.request({ method: 'eth_chainId', params: [] }) as string
  if (chainId === ETH_SEPOLIA_CHAIN_ID) return
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ETH_SEPOLIA_CHAIN_ID }],
    })
  } catch {
    throw new Error('Please switch your wallet to Ethereum Sepolia before bridging.')
  }
}

// ── Formatting helpers ────────────────────────────────────────────────────────
// USDC has 6 decimals

export function formatUsdc(raw: bigint): string {
  const whole = raw / 1_000_000n
  const frac  = raw % 1_000_000n
  return `${whole}.${frac.toString().padStart(6, '0').slice(0, 2)}`
}

export function parseUsdc(amount: string): bigint {
  const [whole = '0', frac = '0'] = amount.split('.')
  return BigInt(whole) * 1_000_000n + BigInt(frac.padEnd(6, '0').slice(0, 6))
}

// ─── Wait for an Ethereum tx to be mined ────────────────────────────────────

async function waitForReceipt(txHash: string, timeoutMs = 120_000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const body = JSON.stringify({
      jsonrpc: '2.0', id: 1,
      method: 'eth_getTransactionReceipt',
      params: [txHash],
    })
    const res  = await fetch(ETH_SEPOLIA_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
    const json = await res.json() as { result?: { status: string } | null }
    if (json.result) {
      if (json.result.status === '0x0') throw new Error('Approve transaction failed on-chain')
      return // mined successfully
    }
    await new Promise(r => setTimeout(r, 3_000)) // poll every 3 s
  }
  throw new Error('Approve transaction timed out — please try again.')
}

// ─── Fetch CCTP fee from IRIS API ────────────────────────────────────────────

async function fetchCctpFee(amount: bigint): Promise<bigint> {
  try {
    const res  = await fetch(`${IRIS_API}/v2/burn/USDC/fees/${CCTP_ETH_DOMAIN}/${CCTP_SN_DOMAIN}`)
    if (!res.ok) throw new Error(`IRIS fee API ${res.status}`)
    const data = await res.json() as { supported: boolean; minFeeUSDC?: string; feeBps?: string }
    if (!data.supported) throw new Error('CCTP route not supported')
    // feeBps — fee as basis points (e.g. 1 = 0.01%)
    if (data.feeBps) {
      return (amount * BigInt(data.feeBps) + 9999n) / 10000n  // ceil
    }
    if (data.minFeeUSDC) {
      return parseUsdc(data.minFeeUSDC)
    }
    return 0n
  } catch {
    // Fallback: 0 fee on testnet
    return 0n
  }
}

// ─── Ethereum → Starknet (CCTP v2) ───────────────────────────────────────────
// Step 1: approve(CCTP_MESSENGER_L1, amount) on USDC ERC-20
// Step 2: depositForBurn(amount, destDomain, mintRecipient, burnToken,
//                        destinationCaller, maxFee, minFinalityThreshold)
//
// Returns the L1 burn tx hash — pass to backend /api/bridge/cctp-attest
// to complete the mint on Starknet.

export async function bridgeEthereumToStarknet(
  ethAddress: string,
  starknetAddress: string,
  rawAmount: bigint,
): Promise<string> {
  if (!starknetAddress || starknetAddress === '0x0') {
    throw new Error('Starknet wallet not ready — make sure the wallet service is running.')
  }

  const provider = getEthProvider()
  await ensureSepolia(provider)

  const maxFee = await fetchCctpFee(rawAmount)

  // Encode params (each as 32-byte slot)
  const amountSlot      = rawAmount.toString(16).padStart(64, '0')
  const destDomainSlot  = CCTP_SN_DOMAIN.toString(16).padStart(64, '0')   // uint32 → slot
  // mintRecipient: Starknet address as bytes32
  const mintRecipient   = starknetAddress.replace('0x', '').padStart(64, '0')
  // burnToken: 20-byte Ethereum address as bytes32 (right-aligned per ABI spec)
  const burnToken       = USDC_ETH.replace('0x', '').padStart(64, '0')
  // destinationCaller: bytes32(0) = any relayer
  const destCaller      = '0'.padStart(64, '0')
  const maxFeeSlot      = maxFee.toString(16).padStart(64, '0')
  // minFinalityThreshold: 1000 = fast-finality lane
  const finalitySlot    = (1000).toString(16).padStart(64, '0')

  const calldata = [
    amountSlot,
    destDomainSlot,
    mintRecipient,
    burnToken,
    destCaller,
    maxFeeSlot,
    finalitySlot,
  ].join('')

  const messengerPad = CCTP_MESSENGER_L1.replace('0x', '').padStart(64, '0')

  // 1. Approve TokenMessenger to spend USDC
  const approveTx = await provider.request({
    method: 'eth_sendTransaction',
    params: [{ from: ethAddress, to: USDC_ETH, data: `${APPROVE}${messengerPad}${amountSlot}` }],
  }) as string
  console.log('[cctp] approve tx:', approveTx)

  // Wait for approve to be mined before spending the allowance
  console.log('[cctp] waiting for approve to be mined…')
  await waitForReceipt(approveTx)
  console.log('[cctp] approve confirmed')

  // 2. depositForBurn
  const burnTx = await provider.request({
    method: 'eth_sendTransaction',
    params: [{ from: ethAddress, to: CCTP_MESSENGER_L1, data: `${DEPOSIT_FOR_BURN}${calldata}` }],
  }) as string
  console.log('[cctp] burn tx:', burnTx)

  return burnTx
}

// ─── Solana → Starknet (Hyperlane) ───────────────────────────────────────────
// Requires @hyperlane-xyz/sdk — stubbed until that package is integrated.

export async function bridgeSolanaToStarknet(
  starknetAddress: string,
  _rawAmount: bigint,
): Promise<string> {
  const solana = (window as unknown as {
    solana?: { isConnected: boolean; connect(): Promise<void> }
  }).solana
  if (!solana) throw new Error('Phantom wallet not found — please install Phantom.')
  if (!solana.isConnected) await solana.connect()

  console.log('[hyperlane] destination:', starknetAddress, 'USDC_SN:', USDC_SN)

  throw new Error('Solana bridging requires @hyperlane-xyz/sdk — coming soon.')
}
