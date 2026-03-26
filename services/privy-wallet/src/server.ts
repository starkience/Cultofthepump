import 'dotenv/config'
import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import fs from 'fs'
import { PrivyClient } from '@privy-io/server-auth'
import { Account, RpcProvider, CallData, CairoCustomEnum, CairoOption, CairoOptionVariant, typedData as snTypedData, type Call, type TypedData, type PaymasterDetails } from 'starknet'

// ─── Config ───────────────────────────────────────────────────────────────────

const PRIVY_APP_ID     = process.env.PRIVY_APP_ID!
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET!
const PORT             = Number(process.env.PORT) || 3002

// AVNU Sepolia paymaster — sponsors gas for Privy embedded wallets
const AVNU_API_KEY     = process.env.AVNU_API_KEY  ?? '18fbce31-5da0-4264-b89a-8fcc09be9ff8'
const AVNU_URL         = 'https://sepolia.paymaster.avnu.fi'

// Starknet RPC + funded relay for CCTP (permissionless receive_message)
const RELAY_ACCOUNT_ADDRESS = process.env.RELAY_ACCOUNT_ADDRESS ?? '0x23a47088e3af2d48e957b8b2af946147a0894da1c22d1bfeb280a6a74f3181'
const RELAY_ACCOUNT_PK      = process.env.RELAY_ACCOUNT_PK      ?? '0x27e6d59156ee6eb424e748040208df6e95daf9667fd8c50f8dc5534fffd87d'
const STARKNET_RPC          = process.env.STARKNET_RPC           ?? 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_10/64DNr-i0S4FY1t0JMUJdq'

if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
  console.error('Missing PRIVY_APP_ID or PRIVY_APP_SECRET in .env')
  process.exit(1)
}

// ─── Privy client ─────────────────────────────────────────────────────────────

const privy = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET)

// ─── Wallet storage ───────────────────────────────────────────────────────────

const WALLETS_FILE = './wallets.json'

type UserWallet = {
  privyWalletId: string
  address:       string
  publicKey:     string
  createdAt:     string
}
type Store = Record<string, UserWallet>

function loadStore(): Store {
  try { return fs.existsSync(WALLETS_FILE) ? JSON.parse(fs.readFileSync(WALLETS_FILE, 'utf-8')) : {} }
  catch { return {} }
}
function saveStore(s: Store) { fs.writeFileSync(WALLETS_FILE, JSON.stringify(s, null, 2)) }

const store = loadStore()

// ─── Auth middleware ──────────────────────────────────────────────────────────

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) { res.status(401).json({ error: 'Missing Authorization header' }); return }
  try {
    const claims = await privy.verifyAuthToken(token)
    ;(req as Request & { userId: string }).userId = claims.userId
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired Privy token' })
  }
}

// ─── Privy REST helpers ───────────────────────────────────────────────────────

const PRIVY_API    = 'https://api.privy.io/v1'
const basicAuth    = Buffer.from(`${PRIVY_APP_ID}:${PRIVY_APP_SECRET}`).toString('base64')
const privyHeaders = {
  'Content-Type':  'application/json',
  'Authorization': `Basic ${basicAuth}`,
  'privy-app-id':  PRIVY_APP_ID,
}

async function createStarknetWallet(): Promise<{ id: string; address: string; publicKey: string }> {
  const res = await fetch(`${PRIVY_API}/wallets`, {
    method: 'POST', headers: privyHeaders,
    body: JSON.stringify({ chain_type: 'starknet' }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as Record<string, string>).message ?? `Privy API ${res.status}`)
  }
  const data = await res.json() as { id: string; address: string; public_key: string }
  return { id: data.id, address: data.address, publicKey: data.public_key }
}

async function privySignHash(walletId: string, hash: string): Promise<string[]> {
  const res = await fetch(`${PRIVY_API}/wallets/${walletId}/rpc`, {
    method: 'POST', headers: privyHeaders,
    body: JSON.stringify({
      method: 'starknet_signHash',
      caip2:  'starknet:SN_SEPOLIA',
      params: { hash },
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Privy sign ${res.status}: ${JSON.stringify(err)}`)
  }
  const data = await res.json() as { data?: { signature?: string[] | string }; signature?: string[] | string }
  const raw  = data.data?.signature ?? data.signature
  if (!raw) throw new Error('Privy returned no signature')
  return Array.isArray(raw) ? raw : [raw]
}

// ─── PrivySigner — delegates signing to Privy's server-side wallet ────────────
// Implements the starknet.js Signer interface so Account can use it with AVNU.

class PrivySigner {
  constructor(private readonly walletId: string, private readonly pubKey: string) {}

  async getPubKey(): Promise<string> { return this.pubKey }

  // Called by Account.signMessage → used by AVNU paymaster flow
  async signMessage(data: TypedData, accountAddress: string): Promise<string[]> {
    const msgHash = snTypedData.getMessageHash(data, accountAddress)
    return privySignHash(this.walletId, msgHash)
  }

  // Called for direct (non-paymaster) executes — not used with AVNU but required by interface
  async signTransaction(_calls: Call[], _details: unknown): Promise<string[]> {
    throw new Error('Direct signing not supported — use AVNU paymaster')
  }
  async signDeployAccountTransaction(_details: unknown): Promise<string[]> {
    throw new Error('Deploy account signing not supported')
  }
  async signDeclareTransaction(_details: unknown): Promise<string[]> {
    throw new Error('Declare signing not supported')
  }
}

// ─── AVNU paymaster execution for Privy wallets ───────────────────────────────
// Creates a starknet.js Account backed by Privy signing + AVNU gas sponsorship.
// Handles undeployed accounts by deriving ArgentX v0.5.0 deployment data.

// ArgentX v0.5.0 — the class Privy uses for Starknet embedded wallets on Sepolia.
// Constructor: { owner: Starknet(pubkey), guardian: None }
// Salt: publicKey itself.
// Verified: calculateContractAddressFromHash(pubkey, classHash, calldata, 0) matches known Privy address.
const ARGENT_X_V0_5_CLASS_HASH = '0x073414441639dcd11d1846f287650a00c60c416b9d3ba45d31c651672125b2c2'

type SnipDeploymentData = NonNullable<PaymasterDetails['deploymentData']>

function buildArgentXDeploymentData(publicKey: string, address: string): SnipDeploymentData {
  const owner    = new CairoCustomEnum({ Starknet: { pubkey: publicKey } })
  const guardian = new CairoOption(CairoOptionVariant.None)
  const calldata = CallData.compile({ owner, guardian })
  return {
    address,
    class_hash: ARGENT_X_V0_5_CLASS_HASH,
    salt:       publicKey,
    calldata,
    version:    1,
  }
}

async function getPrivyDeploymentData(address: string, publicKey: string): Promise<SnipDeploymentData | null> {
  const provider = new RpcProvider({ nodeUrl: STARKNET_RPC })
  try {
    await provider.getClassAt(address)
    return null  // already deployed
  } catch {
    // Not deployed — derive ArgentX v0.5.0 deployment data from public key
    return buildArgentXDeploymentData(publicKey, address)
  }
}

async function executeViaAvnuPaymaster(
  walletId:    string,
  address:     string,
  publicKey:   string,
  calls:       Call[],
): Promise<string> {
  const deploymentData = await getPrivyDeploymentData(address, publicKey)

  const provider = new RpcProvider({ nodeUrl: STARKNET_RPC })
  const signer   = new PrivySigner(walletId, publicKey)

  // Account with embedded AVNU paymaster — executePaymasterTransaction uses AVNU for gas
  const account = new Account({
    provider,
    address,
    signer,
    paymaster: {
      nodeUrl: AVNU_URL,
      headers: { 'x-paymaster-api-key': AVNU_API_KEY },
    },
  })

  const result = await account.executePaymasterTransaction(calls, {
    feeMode:        { mode: 'sponsored' },
    deploymentData: deploymentData ?? undefined,
  })

  return result.transaction_hash
}

// ─── App ──────────────────────────────────────────────────────────────────────

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'privy-wallet' })
})

// ─── Wallet endpoints ─────────────────────────────────────────────────────────

app.post('/api/wallet/starknet', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId
  const existing = store[userId]
  if (existing) {
    return res.json({ isNew: false, wallet: { id: existing.privyWalletId, address: existing.address, publicKey: existing.publicKey } })
  }
  try {
    const wallet = await createStarknetWallet()
    store[userId] = { privyWalletId: wallet.id, address: wallet.address, publicKey: wallet.publicKey, createdAt: new Date().toISOString() }
    saveStore(store)
    return res.json({ isNew: true, wallet: { id: wallet.id, address: wallet.address, publicKey: wallet.publicKey } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[wallet/starknet]', msg)
    return res.status(500).json({ error: msg })
  }
})

app.post('/api/wallet/sign', async (req: Request, res: Response) => {
  const { walletId, hash } = req.body as { walletId?: string; hash?: string }
  if (!walletId || !hash) return res.status(400).json({ error: 'walletId and hash are required' })
  try {
    const signature = await privySignHash(walletId, hash)
    return res.json({ signature })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[wallet/sign]', msg)
    return res.status(500).json({ error: msg })
  }
})

/**
 * POST /api/wallet/execute
 * Requires auth. Body: { calls: Call[] }
 * Executes arbitrary calls from the user's Privy wallet via AVNU paymaster.
 * Handles undeployed accounts automatically.
 */
app.post('/api/wallet/execute', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId
  const { calls } = req.body as { calls?: Call[] }
  if (!calls?.length) return res.status(400).json({ error: 'calls are required' })

  const userWallet = store[userId]
  if (!userWallet) return res.status(400).json({ error: 'No wallet found — call /api/wallet/starknet first' })

  try {
    console.log('[wallet/execute] executing', calls.length, 'call(s) for', userWallet.address)
    const txHash = await executeViaAvnuPaymaster(
      userWallet.privyWalletId,
      userWallet.address,
      userWallet.publicKey,
      calls,
    )
    console.log('[wallet/execute] tx:', txHash)
    return res.json({ transactionHash: txHash })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[wallet/execute]', msg)
    return res.status(500).json({ error: msg })
  }
})

// ─── CCTP v2 attestation + Starknet relay ─────────────────────────────────────
//
// Flow:
//  1. Frontend burns USDC on Ethereum Sepolia → gets burnTxHash
//  2. Frontend POSTs { burnTxHash } here
//  3. Poll IRIS sandbox until attestation is ready (~2 min on testnet)
//  4. Call receive_message via relay account (permissionless — USDC mints to user)
//  5. Return the Starknet tx hash

const IRIS_API                    = 'https://iris-api-sandbox.circle.com'
const CCTP_MSG_TRANSMITTER_SN     = '0x04db7926C64f1f32a840F3Fa95cB551f3801a3600Bae87aF87807A54DCE12Fe8'
const CCTP_SRC_DOMAIN_ETH_SEPOLIA = 0

async function pollAttestationByTxHash(burnTxHash: string, maxWaitMs = 300_000): Promise<{ message: string; attestation: string }> {
  const url      = `${IRIS_API}/v2/messages/${CCTP_SRC_DOMAIN_ETH_SEPOLIA}?transactionHash=${burnTxHash}`
  const deadline = Date.now() + maxWaitMs
  while (Date.now() < deadline) {
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json() as { messages?: Array<{ status: string; message: string; attestation: string }> }
      const msg  = data.messages?.[0]
      if (msg?.status === 'complete' && msg.attestation) return { message: msg.message, attestation: msg.attestation }
    }
    await new Promise(r => setTimeout(r, 5_000))
  }
  throw new Error('Attestation timed out — IRIS did not confirm within 5 minutes.')
}

// ByteArray = [data_len, ...felt252_31-byte-chunks, pending_word, pending_word_len]
function hexToByteArrayCalldata(hex: string): string[] {
  const bytes  = Buffer.from(hex.replace(/^0x/, ''), 'hex')
  const full   = Math.floor(bytes.length / 31)
  const remain = bytes.length % 31
  const out: string[] = [full.toString()]
  for (let i = 0; i < full; i++) out.push('0x' + bytes.subarray(i * 31, (i + 1) * 31).toString('hex'))
  const tail = bytes.subarray(full * 31)
  out.push(tail.length > 0 ? '0x' + tail.toString('hex') : '0x0')
  out.push(remain.toString())
  return out
}

// CCTP receive_message is permissionless (destinationCaller = 0x0).
// We relay from a funded deployer account so the user's wallet needs no STRK.
async function callReceiveMessageViaRelay(contractAddress: string, message: string, attestation: string): Promise<string> {
  const calldata = [...hexToByteArrayCalldata(message), ...hexToByteArrayCalldata(attestation)]
  const provider = new RpcProvider({ nodeUrl: STARKNET_RPC })
  const account  = new Account({ provider, address: RELAY_ACCOUNT_ADDRESS, signer: RELAY_ACCOUNT_PK })
  const result   = await account.execute({ contractAddress, entrypoint: 'receive_message', calldata })
  return result.transaction_hash
}

app.post('/api/bridge/cctp-attest', requireAuth, async (req: Request, res: Response) => {
  const { burnTxHash } = req.body as { burnTxHash?: string }
  if (!burnTxHash) return res.status(400).json({ error: 'burnTxHash is required' })
  try {
    console.log('[cctp-attest] polling IRIS for:', burnTxHash)
    const { message, attestation } = await pollAttestationByTxHash(burnTxHash)
    console.log('[cctp-attest] relaying via deployer…')
    const starknetTxHash = await callReceiveMessageViaRelay(CCTP_MSG_TRANSMITTER_SN, message, attestation)
    console.log('[cctp-attest] Starknet tx:', starknetTxHash)
    return res.json({ starknetTxHash })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[cctp-attest]', msg)
    return res.status(500).json({ error: msg })
  }
})

app.post('/api/bridge/cctp-retry', async (req: Request, res: Response) => {
  const { burnTxHash } = req.body as { burnTxHash?: string }
  if (!burnTxHash) return res.status(400).json({ error: 'burnTxHash is required' })
  try {
    console.log('[cctp-retry] polling IRIS for:', burnTxHash)
    const { message, attestation } = await pollAttestationByTxHash(burnTxHash)
    const starknetTxHash = await callReceiveMessageViaRelay(CCTP_MSG_TRANSMITTER_SN, message, attestation)
    console.log('[cctp-retry] done:', starknetTxHash)
    return res.json({ starknetTxHash })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[cctp-retry]', msg)
    return res.status(500).json({ error: msg })
  }
})

app.post('/api/bridge/cctp-relay-direct', async (req: Request, res: Response) => {
  const { message, attestation } = req.body as { message?: string; attestation?: string }
  if (!message || !attestation) return res.status(400).json({ error: 'message and attestation are required' })
  try {
    const starknetTxHash = await callReceiveMessageViaRelay(CCTP_MSG_TRANSMITTER_SN, message, attestation)
    console.log('[cctp-relay-direct] done:', starknetTxHash)
    return res.json({ starknetTxHash })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[cctp-relay-direct]', msg)
    return res.status(500).json({ error: msg })
  }
})

// ─── Start ────────────────────────────────────────────────────────────────────

const server = app.listen(PORT, () => {
  console.log(`[privy-wallet] running on http://localhost:${PORT}`)
})
server.on('error', (err) => console.error('[privy-wallet] server error:', err))
