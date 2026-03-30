# Cult of the Pump

A full-stack memecoin launchpad on Starknet with gasless UX, bonding curves, and AVNU-powered swaps.

## Architecture

```
apps/interface/          React frontend (Vite + Tamagui)
services/privy-wallet/   Wallet service (Privy + StarkZap + AVNU paymaster)
services/api/            Metadata API + WebSocket chat (Go + Postgres)
services/indexer/        On-chain indexer (DipDup)
services/graphql-bridge/ GraphQL layer over indexer DB
protocol/contracts/      Cairo smart contracts (Scarb)
```

## Key Integrations

- **StarkZap SDK** -- wallet management, AVNU swap provider, account presets, gasless deployment
- **Privy** (`@privy-io/node`) -- embedded Starknet wallet creation + signing via `rawSign`
- **AVNU Paymaster** -- gasless transactions for all users
- **CCTP v2** -- USDC bridging from Ethereum to Starknet
- **starknet-react** -- wallet connectors (ArgentX/Braavos) + read-only hooks
- **Ekubo** -- AMM pool creation on graduation (101,010 STRK market cap)

## How It Works

1. **Login** -- users connect via ArgentX, Braavos, MetaMask, or Phantom (custom login popup)
2. **Embedded wallet** -- each user gets a Privy-managed Starknet wallet for gasless execution
3. **Deposit** -- USDC from Ethereum (CCTP bridge, ~5 min) or Starknet wallet (direct transfer, ~2s)
4. **Swap** -- USDC/STRK swaps via StarkZap's AVNU provider
5. **Summon** -- create a new cult token (Dutch auction fee + bonding curve launch)
6. **Trade** -- buy/sell cult tokens on the bonding curve (pre-graduation)
7. **Graduate** -- when market cap hits 101,010 STRK, liquidity moves to Ekubo AMM
8. **Withdraw** -- send USDC to Starknet address or bridge back to Ethereum via CCTP

## Quick Start

### Prerequisites

- Node.js 20+, Go 1.22+, Python 3.11+, PostgreSQL 16+
- [Scarb](https://docs.swmansion.com/scarb/) (for Cairo contracts)
- Yarn (Berry / v4)

### 1. Clone & install

```bash
git clone https://github.com/your-org/cultofthepump.git
cd cultofthepump
cd apps/interface && yarn install
cd services/privy-wallet && yarn install
```

### 2. Configure environment

```bash
# Frontend
cp apps/interface/apps/web/.env.example apps/interface/apps/web/.env
# Edit: VITE_ALCHEMY_RPC_URL, VITE_PRIVY_APP_ID, VITE_AVNU_API_KEY

# Wallet service
cp services/privy-wallet/.env.example services/privy-wallet/.env
# Edit: PRIVY_APP_ID, PRIVY_APP_SECRET, AVNU_API_KEY, STARKNET_RPC, JWT_SECRET, relay keys
```

### Required API Keys

| Service | Where to get | Used for |
|---------|-------------|----------|
| **Privy** | https://dashboard.privy.io | Embedded wallet creation + signing |
| **AVNU** | https://www.avnu.fi | Paymaster (gasless tx) + swap aggregator |
| **Alchemy** | https://www.alchemy.com | Starknet Sepolia RPC |

### 3. Start services

```bash
# Terminal 1: Frontend
cd apps/interface && yarn workspace @cotp/interface start
# → http://localhost:5173

# Terminal 2: Wallet service
cd services/privy-wallet && yarn dev
# → http://localhost:3002

# Terminal 3: Metadata API (requires Postgres running)
cd services/api && go run cmd/cotp-api/main.go
# → http://localhost:8080

# Terminal 4: GraphQL bridge
cd services/graphql-bridge && node index.js
# → http://localhost:42000

# Terminal 5: Indexer (optional — needed for trade history)
cd services/indexer/cotp_indexer && dipdup run
```

### 4. Open the app

Visit **http://localhost:5173**

## Smart Contracts

All contracts are written in Cairo and deployed on Starknet Sepolia.

### Bonding Curve — pricing engine

Uses an exponential bonding curve `k * exp(a * n)` to price tokens based on market cap. The integral of the curve determines how many tokens you receive for a given STRK input.

```cairo
// protocol/contracts/contracts/src/bonding_curve/contract.cairo

#[storage]
struct Storage {
    /// The bonding curve equation is of the form k * exp(a * n)
    a: Fixed,
    k: Fixed,
    precomputed_a: Fixed, // 10_000_000 / (k * a) — cached for gas efficiency
}

fn buy(self: @ContractState, market_cap: u256, buy: u256) -> u256 {
    let M0 = FixedTrait::new_unscaled(market_cap, false);
    let M1 = M0 + buy_fixed;
    let neg_a = -self.a.read();
    // Integral of the bonding curve between market_cap and market_cap + buy
    let N = self.precomputed_a.read() * ((neg_a * M0).exp() - (neg_a * M1).exp());
    N.ceil().try_into().unwrap()
}

fn sell(self: @ContractState, market_cap: u256, tokens: u256) -> u256 {
    // Inverse of buy — solves for STRK given token amount
    let exp_a_mcap = (mcap * a).exp().floor();
    let strk = ((sell * exp_a_mcap / self.precomputed_a.read()) + FixedTrait::ONE()).ln() / a;
    strk.floor().try_into().unwrap()
}
```

### Swap — buy/sell with auto-graduation

Handles all pre-graduation trading. When market cap reaches 101,010 STRK, liquidity automatically migrates to an Ekubo AMM pool.

```cairo
// protocol/contracts/contracts/src/swap/contract.cairo

fn buy(ref self: ContractState, strk: u256, token: IERC20Dispatcher) -> u256 {
    // 1. Calculate and collect 1% fee (split between treasury and stakers)
    let fees = strk / self.fees.read().into(); // Default: 100 = 1%
    let buy = strk - fees;

    // 2. Route fees to staking contract (if enabled)
    if staking_addr != zero_address {
        let staking_fees = fees * staking_bps / 10000;
        ICultStakingDispatcher { contract_address: staking_addr }
            .notify_reward(token.contract_address, staking_fees);
    }

    // 3. Calculate tokens from bonding curve
    let tokens = self.bonding_curve.read().buy(:market_cap, :buy);

    // 4. Auto-graduate: if remaining supply is less than calculated tokens,
    //    launch on Ekubo DEX and give remaining tokens to buyer
    if remaining_tokens < tokens {
        self.launch_on_dex(token);
    }

    token.transfer(caller, transfer_amount.into());
}
```

Key features:
- **1% trading fee** split between treasury and stakers
- **Auto-graduation** when bonding curve supply exhausts (~101,010 STRK market cap)
- **Ekubo integration** — creates a full-range liquidity position on graduation

### Dutch Auction — summon pricing

A linearly-decaying auction that determines the cost to launch a new token. Price starts high and decays to a floor over a fixed duration.

```cairo
// protocol/contracts/contracts/src/dutch_auction/contract.cairo

fn create_auction(ref self: ContractState, start_time: u64, start_price: u256) {
    // Linear decay: price = a * timestamp + b
    let a = (start_price - end_price) / duration;  // slope (negative)
    let b = start_price - a * start_timestamp;       // y-intercept
    self.a.write(a);
    self.b.write(b);
}

fn current_price(self: @ContractState) -> u256 {
    // y = a * x + b (linear interpolation)
    (self.a.read() * timestamp + self.b.read()).try_into().unwrap()
}

fn bid(ref self: ContractState, name: ByteArray, symbol: ByteArray, sniping: u256) {
    let current_price = self.current_price();
    strk.transfer_from(caller, self_address, current_price);

    // Creator can optionally pre-buy tokens at launch ("sniping")
    if sniping > 0 {
        strk.transfer_from(caller, self_address, sniping);
    }

    // Deploy the new token via the Factory
    let shitcoin = factory.launshitcoin(caller, name, symbol, sniping);

    // Next auction starts at 2x the bid price
    self.create_auction(current_timestamp, current_price * 2);
}
```

Key features:
- **Decaying price** — wait longer, pay less (minimum 10 STRK floor)
- **Auto-restart** — each successful bid starts a new auction at 2x the price
- **Creator pre-buy** — optional initial token purchase bundled with launch

### Factory — token deployment

Deploys new ERC20 cult tokens using `deploy_syscall` with deterministic addresses.

```cairo
// protocol/contracts/contracts/src/factory/contract.cairo

fn launshitcoin(
    ref self: ContractState,
    user: ContractAddress,
    shit_name: ByteArray,
    shit_symbol: ByteArray,
    initial_shniping: u256,
) -> ContractAddress {
    // Deploy ERC20 with deterministic salt (creator + timestamp)
    let (shitcoin_address, _) = deploy_syscall(
        self.shitcoin_class_hash.read(),
        pedersen(caller.into(), get_block_timestamp().into()),
        constructor_calldata.span(),
        true,
    ).unwrap();

    // If creator wants to pre-buy, execute a buy on the bonding curve
    if initial_shniping > 0 {
        strk.approve(swap.contract_address, initial_shniping);
        let tokens = swap.buy(initial_shniping, token);
        token.transfer(user, tokens); // Send pre-bought tokens to creator
    }

    shitcoin_address
}
```

- Total supply: **1,000,000,000 tokens** (1e27 wei) per cult
- Each token is a standard OpenZeppelin ERC20

### Staking — fee-sharing yield

Per-token staking using the Synthetix "reward-per-token" accumulator pattern. Stakers earn STRK yield from trading fees.

```cairo
// protocol/contracts/contracts/src/staking.cairo

/// Flywheel:
///   High-volume cult → more fees → more STRK yield →
///   believers stake → price pressure → more volume

trait ICultStaking {
    fn stake(ref self, token: ContractAddress, amount: u256);
    fn unstake(ref self, token: ContractAddress, amount: u256);
    fn claim(ref self, token: ContractAddress) -> u256;

    // Called by Swap contract after each trade
    fn notify_reward(ref self, token: ContractAddress, strk_amount: u256);

    // Views
    fn total_staked(self, token: ContractAddress) -> u256;
    fn staked_balance(self, token: ContractAddress, staker: ContractAddress) -> u256;
    fn earned(self, token: ContractAddress, staker: ContractAddress) -> u256;
}
```

Key features:
- **Per-token pools** — each cult token has its own staking pool
- **Automatic fee routing** — Swap contract sends a configurable % of fees directly
- **No lock-up** — stake and unstake at any time
- **Precision** — all per-token values scaled by 1e18 to avoid truncation

### Deployed Addresses (Sepolia)

| Contract | Address |
|----------|---------|
| Factory | `0x0135abb443cbba9738fe63d55a06810fdf14b605ddc5262220a889411baede25` |
| Swap (Bonding Curve) | `0x07a6c0500a1596c0a501156ba660c84c461a599053ab96319d61dfc2626a45b9` |
| Bonding Curve | `0x051edfc985b303c7517e1daadd972b8edbe4bfd8484edc6f9a810704c0931975` |
| Dutch Auction | `0x019326451eb2955333d4238cd2bdd526a1af5cca842511e3246da61f9a1d859a` |
| Staking | `0x022db715ee9f9b7395e2a250b069a1f07f92b119cacb5bfd35c8cb77bfc7aa3e` |

## Project Structure

```
apps/interface/apps/web/src/
  components/
    LoginModal/        Custom wallet connect popup (ArgentX, Braavos, MetaMask, Phantom)
    DepositModal/      USDC deposit (Starknet transfer or Ethereum CCTP bridge)
    WithdrawModal/     USDC withdrawal to Starknet or Ethereum
    TransactionModal/  Transaction execution + receipt polling
    ChatRoom/          Real-time chat + trade feed
    PrivyConnect/      Header buttons (Connect, Deposit, Withdraw)
    ModalShell/        Animated modal backdrop
  context/
    WalletContext.tsx   Unified wallet abstraction (Privy + native Starknet wallets)
  hooks/
    usePrivyExecute.ts  Transaction execution via wallet service
  pages/
    Landing/           Cult token grid + leaderboard + chat
    Summon/            Create new cult token
    Trade/             Buy/sell on bonding curve
    Portfolio/         Balances + holdings + swaps + transaction log
    Feed/              Live activity stream
    Leaderboard/       Top cults by volume/believers/graduation

services/privy-wallet/src/server.ts
  - POST /api/auth/starknet-login   Starknet wallet auth (sign challenge → JWT)
  - POST /api/auth/evm-login        EVM wallet auth (personal_sign → JWT)
  - POST /api/wallet/starknet       Create/get Privy embedded wallet
  - POST /api/wallet/execute         Execute calls via StarkZap + AVNU paymaster
  - POST /api/wallet/sign            Sign a hash with Privy rawSign
  - POST /api/bridge/cctp-attest     Ethereum→Starknet CCTP attestation + relay
  - POST /api/bridge/cctp-attest-l2  Starknet→Ethereum CCTP attestation

protocol/contracts/
  src/swap/            Bonding curve + token buy/sell
  src/staking.cairo    Token staking for fee yield
  scripts/deploy/      Deployment scripts
```

## Gasless Transaction Flow

```
User action (summon/buy/sell/swap)
  → Frontend builds Call[] via starknet.js .populate()
  → POST /api/wallet/execute with JWT auth
  → Server: StarkZap connectWallet (PrivySigner + ArgentX v0.5.0 preset)
  → Server: wallet.ensureReady (auto-deploy if needed, paymaster-sponsored)
  → Server: wallet.execute(calls, { feeMode: 'sponsored' })
  → AVNU paymaster sponsors gas
  → Privy rawSign signs the transaction
  → Transaction submitted to Starknet
  → Hash returned to frontend immediately
```

## License

GPL-3.0
