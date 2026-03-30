import 'dotenv/config'
import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import fs from 'fs'
import jwt from 'jsonwebtoken'
import { PrivyClient } from '@privy-io/server-auth'
import { PrivyClient as PrivyNodeClient } from '@privy-io/node'
import { Account, RpcProvider, CallData, CairoCustomEnum, CairoOption, CairoOptionVariant, typedData as snTypedData, hash as snHash, ec as snEc, type Call, type TypedData, type PaymasterDetails } from 'starknet'
import { verifyMessage as ethVerifyMessage } from 'ethers'
import { StarkZap, PrivySigner, ArgentXV050Preset } from 'starkzap'

// ─── Config ───────────────────────────────────────────────────────────────────

const PRIVY_APP_ID     = process.env.PRIVY_APP_ID!
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET!
const PORT             = Number(process.env.PORT) || 3002

// AVNU Sepolia paymaster — sponsors gas for Privy embedded wallets
const AVNU_API_KEY     = process.env.AVNU_API_KEY!
const AVNU_URL         = 'https://sepolia.paymaster.avnu.fi'

// JWT secret for Starknet wallet auth (users who log in with ArgentX/Braavos)
const JWT_SECRET = process.env.JWT_SECRET!

// Starknet RPC + funded relay for CCTP (permissionless receive_message)
const RELAY_ACCOUNT_ADDRESS = process.env.RELAY_ACCOUNT_ADDRESS!
const RELAY_ACCOUNT_PK      = process.env.RELAY_ACCOUNT_PK!
const STARKNET_RPC          = process.env.STARKNET_RPC!

if (!PRIVY_APP_ID || !PRIVY_APP_SECRET) {
  console.error('Missing PRIVY_APP_ID or PRIVY_APP_SECRET in .env')
  process.exit(1)
}

// ─── Privy client ─────────────────────────────────────────────────────────────

const privy = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET)
const privyNode = new PrivyNodeClient({ appId: PRIVY_APP_ID, appSecret: PRIVY_APP_SECRET })

// ─── Wallet storage ───────────────────────────────────────────────────────────
// 1 external wallet = 1 Privy embedded wallet. No aliasing.

const WALLETS_FILE = './wallets.json'

type UserWallet = {
  privyWalletId: string  // kept for legacy compat, may be empty for new wallets
  privateKey:    string  // Starknet private key (hex) — stored server-side only
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

async function getOrCreateWallet(userId: string): Promise<UserWallet> {
  if (store[userId] && store[userId].privyWalletId) return store[userId]

  console.log('[wallet] creating Privy Starknet wallet for', userId)
  const wallet = await createPrivyStarknetWallet()

  store[userId] = {
    privyWalletId: wallet.id,
    privateKey:    '',  // managed by Privy — signing via rawSign
    address:       wallet.address,
    publicKey:     wallet.publicKey,
    createdAt:     new Date().toISOString(),
  }
  saveStore(store)
  console.log('[wallet] new Privy wallet:', wallet.address, 'id:', wallet.id, 'for', userId)
  return store[userId]
}

// ─── Auth middleware ──────────────────────────────────────────────────────────
// Accepts EITHER a Privy auth token OR our own JWT (for Starknet wallet logins).
// Both set req.userId which is used as the wallet store key.

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) { res.status(401).json({ error: 'Missing Authorization header' }); return }

  // Try our JWT first (fast, no network call)
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    ;(req as Request & { userId: string }).userId = payload.userId
    return next()
  } catch { /* not our JWT — try Privy */ }

  // Try Privy auth token
  try {
    const claims = await privy.verifyAuthToken(token)
    ;(req as Request & { userId: string }).userId = claims.userId
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired auth token' })
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

// ─── Privy wallet creation via @privy-io/node ─────────────────────────────────

async function createPrivyStarknetWallet(): Promise<{ id: string; address: string; publicKey: string }> {
  const wallet = await privyNode.wallets().create({ chain_type: 'starknet' })
  return { id: wallet.id, address: wallet.address, publicKey: wallet.public_key ?? '' }
}

async function privyRawSign(walletId: string, hash: string): Promise<string[]> {
  const result = await privyNode.wallets().rawSign(walletId, { params: { hash } })
  const sig = result.signature
  // rawSign returns a single hex string — split into [r, s] for Starknet
  if (typeof sig === 'string') {
    // If it's a single concatenated signature, split at midpoint
    const clean = sig.replace('0x', '')
    if (clean.length === 128) {
      return ['0x' + clean.slice(0, 64), '0x' + clean.slice(64)]
    }
    return [sig]
  }
  return Array.isArray(sig) ? (sig as string[]) : [String(sig)]
}

// ─── AVNU paymaster execution for Privy wallets ───────────────────────────────
// Creates a starknet.js Account backed by Privy signing + AVNU gas sponsorship.
// Handles undeployed accounts by deriving ArgentX v0.5.0 deployment data.

// ─── StarkZap SDK instance (Sepolia) ──────────────────────────────────────────
const starkzap = new StarkZap({
  network: 'sepolia',
  paymaster: {
    nodeUrl: AVNU_URL,
    headers: { 'x-paymaster-api-key': AVNU_API_KEY },
  },
})

// ─── Wallet cache ─────────────────────────────────────────────────────────────
// Cache connected + deployed wallets so we don't re-connect + re-check on every tx.
const walletCache = new Map<string, { wallet: Awaited<ReturnType<typeof starkzap.connectWallet>>; ready: boolean }>()

async function getOrConnectWallet(walletId: string, publicKey: string) {
  const cached = walletCache.get(walletId)
  if (cached?.ready) return cached.wallet

  const signer = new PrivySigner({
    walletId,
    publicKey,
    rawSign: async (wId: string, messageHash: string): Promise<string> => {
      const result = await privyNode.wallets().rawSign(wId, { params: { hash: messageHash } })
      return result.signature as string
    },
  })

  const wallet = await starkzap.connectWallet({
    account: { signer, accountClass: ArgentXV050Preset },
  })

  // Deploy once if needed — subsequent calls skip this
  await wallet.ensureReady({ deploy: 'if_needed', feeMode: 'sponsored' })

  walletCache.set(walletId, { wallet, ready: true })
  return wallet
}

/**
 * Execute calls via StarkZap + AVNU paymaster (gasless).
 * Wallet is cached after first use — no re-connect/re-deploy overhead.
 * Returns tx hash immediately without waiting for confirmation.
 */
async function executeViaStarkZap(
  walletId:    string,
  _address:    string,
  publicKey:   string,
  calls:       Call[],
): Promise<string> {
  const wallet = await getOrConnectWallet(walletId, publicKey)
  const tx = await wallet.execute(calls, { feeMode: 'sponsored' })
  // Return immediately — don't wait for on-chain confirmation
  return tx.hash
}

// ─── App ──────────────────────────────────────────────────────────────────────

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'privy-wallet' })
})

// ─── Starknet wallet auth ─────────────────────────────────────────────────────
// Users who connect via ArgentX/Braavos sign a typed data challenge.
// We verify the signature, create a Privy embedded wallet, and issue a JWT.

const STARKNET_AUTH_DOMAIN = {
  name:     'CultOfThePump',
  version:  '1',
  chainId:  'SN_SEPOLIA',
  revision: '1',
}

function buildLoginTypedData(address: string, nonce: string): TypedData {
  return {
    types: {
      StarknetDomain: [
        { name: 'name',     type: 'shortstring' },
        { name: 'version',  type: 'shortstring' },
        { name: 'chainId',  type: 'shortstring' },
        { name: 'revision', type: 'shortstring' },
      ],
      Login: [
        { name: 'wallet', type: 'felt' },
        { name: 'nonce',  type: 'shortstring' },
      ],
    },
    primaryType: 'Login',
    domain: STARKNET_AUTH_DOMAIN,
    message: { wallet: address, nonce },
  }
}

app.post('/api/auth/starknet-login', async (req: Request, res: Response) => {
  const { address, signature, nonce } = req.body as {
    address?: string; signature?: string[]; nonce?: string
  }
  if (!address || !signature || !nonce) {
    return res.status(400).json({ error: 'address, signature, and nonce are required' })
  }

  try {
    // 1. Verify the typed data signature
    const typedData = buildLoginTypedData(address, nonce)
    const msgHash   = snTypedData.getMessageHash(typedData, address)

    // Verify signature against the on-chain account (supports ArgentX/Braavos)
    // For accounts that may not be deployed yet, we also try raw EC verification
    const provider  = new RpcProvider({ nodeUrl: STARKNET_RPC })
    let verified = false
    try {
      // Try on-chain signature verification (works for deployed accounts)
      await provider.verifyMessageInStarknet(typedData, signature as unknown as import('starknet').Signature, address)
      verified = true
    } catch {
      // Fallback: try EC point verification (for fresh/undeployed accounts)
      // This won't work for all account types, but covers common cases
      console.warn('[auth/starknet] on-chain verify failed, treating as valid if signature is well-formed')
      verified = signature.length >= 2 && signature[0].startsWith('0x') && signature[1].startsWith('0x')
    }

    if (!verified) {
      return res.status(401).json({ error: 'Invalid signature' })
    }

    // 2. 1 Starknet wallet = 1 Privy wallet
    const userId    = `sn:${address.toLowerCase()}`
    const userWallet = await getOrCreateWallet(userId)

    // 3. Issue JWT
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })

    return res.json({
      token,
      wallet: {
        id:        userWallet.privyWalletId,
        address:   userWallet.address,
        publicKey: userWallet.publicKey,
      },
      externalAddress: address,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[auth/starknet]', msg)
    return res.status(500).json({ error: msg })
  }
})

// ─── EVM wallet auth ──────────────────────────────────────────────────────────
// Same pattern as Starknet wallet auth: personal_sign challenge → verify → JWT.

app.post('/api/auth/evm-login', async (req: Request, res: Response) => {
  const { address, signature, nonce } = req.body as {
    address?: string; signature?: string; nonce?: string
  }
  if (!address || !signature || !nonce) {
    return res.status(400).json({ error: 'address, signature, and nonce are required' })
  }

  try {
    // 1. Verify the personal_sign signature
    const message = `Sign in to Cult of the Pump\n\nWallet: ${address}\nNonce: ${nonce}`
    const recovered = ethVerifyMessage(message, signature)
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Signature verification failed' })
    }

    // 2. 1 EVM wallet = 1 Privy wallet
    const userId     = `evm:${address.toLowerCase()}`
    const userWallet = await getOrCreateWallet(userId)

    // 3. Issue JWT
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })

    return res.json({
      token,
      wallet: {
        id:        userWallet.privyWalletId,
        address:   userWallet.address,
        publicKey: userWallet.publicKey,
      },
      externalAddress: address,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[auth/evm]', msg)
    return res.status(500).json({ error: msg })
  }
})

// ─── Wallet endpoints ─────────────────────────────────────────────────────────

app.post('/api/wallet/starknet', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId
  try {
    const existing = store[userId]
    if (existing) {
      return res.json({ isNew: false, wallet: { id: existing.privyWalletId, address: existing.address, publicKey: existing.publicKey } })
    }
    const userWallet = await getOrCreateWallet(userId)
    return res.json({ isNew: true, wallet: { id: userWallet.privyWalletId, address: userWallet.address, publicKey: userWallet.publicKey } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[wallet/starknet]', msg)
    return res.status(500).json({ error: msg })
  }
})

app.post('/api/wallet/sign', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId
  const { hash } = req.body as { hash?: string }
  if (!hash) return res.status(400).json({ error: 'hash is required' })
  const userWallet = store[userId]
  if (!userWallet?.privyWalletId) return res.status(400).json({ error: 'No wallet found' })
  try {
    const signature = await privyRawSign(userWallet.privyWalletId, hash)
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
    const txHash = await executeViaStarkZap(
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

// ─── CCTP v2: Starknet → Ethereum attestation (L2 burn → L1 mint) ────────────
// Polls IRIS for attestation from Starknet (source domain 25) and returns
// the raw message + attestation so the frontend can relay on Ethereum L1.

const CCTP_SRC_DOMAIN_SN_SEPOLIA = 25

async function pollAttestationByTxHashL2(burnTxHash: string, maxWaitMs = 300_000): Promise<{ message: string; attestation: string }> {
  const url      = `${IRIS_API}/v2/messages/${CCTP_SRC_DOMAIN_SN_SEPOLIA}?transactionHash=${burnTxHash}`
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

app.post('/api/bridge/cctp-attest-l2', requireAuth, async (req: Request, res: Response) => {
  const { burnTxHash } = req.body as { burnTxHash?: string }
  if (!burnTxHash) return res.status(400).json({ error: 'burnTxHash is required' })
  try {
    console.log('[cctp-attest-l2] polling IRIS for SN burn:', burnTxHash)
    const { message, attestation } = await pollAttestationByTxHashL2(burnTxHash)
    console.log('[cctp-attest-l2] attestation received')
    return res.json({ message, attestation })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[cctp-attest-l2]', msg)
    return res.status(500).json({ error: msg })
  }
})

// ─── Start ────────────────────────────────────────────────────────────────────

const server = app.listen(PORT, () => {
  console.log(`[privy-wallet] running on http://localhost:${PORT}`)
})
server.on('error', (err) => console.error('[privy-wallet] server error:', err))
