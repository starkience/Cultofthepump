/// CultStaking — per-token staking with fee-sharing yield
///
/// Mechanism:
///   1. Users stake their cult ERC20 tokens into this contract
///   2. The Swap contract (after upgrade) sends a share of each trade's fee here
///   3. Stakers earn STRK yield proportional to their staked share
///   4. More volume in a cult = more yield for its stakers
///
/// Flywheel:
///   High-volume cult → more fees → more STRK yield → believers stake → price pressure → more volume
///
/// Uses the "reward-per-token" accounting pattern (same as Synthetix staking rewards).
/// Precision: all per-token values scaled by 10^18 to avoid integer truncation.

use starknet::ContractAddress;

#[starknet::interface]
pub trait ICultStaking<TContractState> {
    /// Called by the Swap contract after it has already transferred STRK to this contract.
    /// Updates the reward-per-token accumulator without performing any transfer.
    fn notify_reward(ref self: TContractState, token: ContractAddress, strk_amount: u256);

    /// Legacy: Called by the Swap contract to pull and deposit fees for a given token's stakers.
    fn deposit_fees(ref self: TContractState, token: ContractAddress, strk_amount: u256);

    /// Stake `amount` of `token`. Caller must have approved this contract.
    fn stake(ref self: TContractState, token: ContractAddress, amount: u256);

    /// Unstake `amount` of `token` and return it to caller.
    fn unstake(ref self: TContractState, token: ContractAddress, amount: u256);

    /// Claim all accumulated STRK rewards for `token`.
    fn claim(ref self: TContractState, token: ContractAddress) -> u256;

    /// Stake + claim in one call (convenience).
    fn stake_and_claim(ref self: TContractState, token: ContractAddress, amount: u256) -> u256;

    // ── Views ─────────────────────────────────────────────────────────────────

    /// Total staked supply for a given token.
    fn total_staked(self: @TContractState, token: ContractAddress) -> u256;

    /// Staked balance of `staker` for `token`.
    fn staked_balance(self: @TContractState, token: ContractAddress, staker: ContractAddress) -> u256;

    /// Pending claimable STRK for `staker` in `token`'s pool.
    fn earned(self: @TContractState, token: ContractAddress, staker: ContractAddress) -> u256;

    /// Total STRK fees ever deposited for a token's pool.
    fn total_fees_deposited(self: @TContractState, token: ContractAddress) -> u256;

    /// Address authorised to call deposit_fees (the Swap contract).
    fn swap_address(self: @TContractState) -> ContractAddress;
}

#[starknet::contract]
pub mod cult_staking {
    use super::ICultStaking;
    use openzeppelin_access::ownable::OwnableComponent;
    use openzeppelin_interfaces::erc20::{IERC20Dispatcher, IERC20DispatcherTrait};
    use starknet::{
        ContractAddress, get_caller_address, get_contract_address,
        storage::{StoragePointerReadAccess, StoragePointerWriteAccess, StoragePathEntry, Map},
    };

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    /// Scaling factor for reward-per-token accumulator (avoids truncation).
    const PRECISION: u256 = 1_000_000_000_000_000_000; // 1e18

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        Staked: Staked,
        Unstaked: Unstaked,
        Claimed: Claimed,
        FeesDeposited: FeesDeposited,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Staked {
        pub token: ContractAddress,
        pub staker: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Unstaked {
        pub token: ContractAddress,
        pub staker: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Claimed {
        pub token: ContractAddress,
        pub staker: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct FeesDeposited {
        pub token: ContractAddress,
        pub amount: u256,
        pub new_reward_per_token: u256,
    }

    #[storage]
    struct Storage {
        /// STRK token contract.
        strk: IERC20Dispatcher,
        /// Only this address may call deposit_fees (set to Swap contract).
        swap: ContractAddress,

        // ── Per-token pool state ──────────────────────────────────────────────

        /// Total tokens staked across all stakers, per cult token.
        total_staked: Map<ContractAddress, u256>,
        /// Accumulated STRK reward per staked token (scaled by PRECISION).
        reward_per_token_stored: Map<ContractAddress, u256>,
        /// Total fees ever deposited into this pool.
        total_fees_deposited: Map<ContractAddress, u256>,

        // ── Per-user state ────────────────────────────────────────────────────

        /// How many tokens a user has staked per cult.
        staker_balance: Map<(ContractAddress, ContractAddress), u256>,
        /// Snapshot of reward_per_token_stored at last user interaction.
        user_reward_snapshot: Map<(ContractAddress, ContractAddress), u256>,
        /// Accumulated but unclaimed STRK rewards.
        pending_rewards: Map<(ContractAddress, ContractAddress), u256>,

        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        strk: IERC20Dispatcher,
        swap: ContractAddress,
        owner: ContractAddress,
    ) {
        self.strk.write(strk);
        self.swap.write(swap);
        self.ownable.initializer(owner);
    }

    #[abi(embed_v0)]
    impl CultStakingImpl of ICultStaking<ContractState> {
        // ── Mutating ─────────────────────────────────────────────────────────

        /// Accounting-only: Swap has already transferred STRK here. Just update the accumulator.
        fn notify_reward(ref self: ContractState, token: ContractAddress, strk_amount: u256) {
            assert!(get_caller_address() == self.swap.read(), "Only Swap can notify rewards");
            assert!(strk_amount > 0, "Amount must be > 0");
            self._accumulate_reward(token, strk_amount);
        }

        fn deposit_fees(ref self: ContractState, token: ContractAddress, strk_amount: u256) {
            assert!(get_caller_address() == self.swap.read(), "Only Swap can deposit fees");
            assert!(strk_amount > 0, "Amount must be > 0");
            // Pull STRK from Swap into this contract
            self.strk.read().transfer_from(get_caller_address(), get_contract_address(), strk_amount);
            self._accumulate_reward(token, strk_amount);
        }

        fn stake(ref self: ContractState, token: ContractAddress, amount: u256) {
            assert!(amount > 0, "Amount must be > 0");
            let caller = get_caller_address();
            self._update_rewards(token, caller);

            let token_contract = IERC20Dispatcher { contract_address: token };
            token_contract.transfer_from(caller, get_contract_address(), amount);

            let prev_bal = self.staker_balance.entry((token, caller)).read();
            self.staker_balance.entry((token, caller)).write(prev_bal + amount);
            let prev_total = self.total_staked.entry(token).read();
            self.total_staked.entry(token).write(prev_total + amount);

            self.emit(Staked { token, staker: caller, amount });
        }

        fn unstake(ref self: ContractState, token: ContractAddress, amount: u256) {
            assert!(amount > 0, "Amount must be > 0");
            let caller = get_caller_address();
            self._update_rewards(token, caller);

            let bal = self.staker_balance.entry((token, caller)).read();
            assert!(bal >= amount, "Insufficient staked balance");
            self.staker_balance.entry((token, caller)).write(bal - amount);
            let total = self.total_staked.entry(token).read();
            self.total_staked.entry(token).write(total - amount);

            IERC20Dispatcher { contract_address: token }.transfer(caller, amount);
            self.emit(Unstaked { token, staker: caller, amount });
        }

        fn claim(ref self: ContractState, token: ContractAddress) -> u256 {
            let caller = get_caller_address();
            self._update_rewards(token, caller);

            let reward = self.pending_rewards.entry((token, caller)).read();
            if reward == 0 {
                return 0;
            }
            self.pending_rewards.entry((token, caller)).write(0);
            self.strk.read().transfer(caller, reward);
            self.emit(Claimed { token, staker: caller, amount: reward });
            reward
        }

        fn stake_and_claim(ref self: ContractState, token: ContractAddress, amount: u256) -> u256 {
            self.stake(token, amount);
            self.claim(token)
        }

        // ── Views ─────────────────────────────────────────────────────────────

        fn total_staked(self: @ContractState, token: ContractAddress) -> u256 {
            self.total_staked.entry(token).read()
        }

        fn staked_balance(self: @ContractState, token: ContractAddress, staker: ContractAddress) -> u256 {
            self.staker_balance.entry((token, staker)).read()
        }

        fn earned(self: @ContractState, token: ContractAddress, staker: ContractAddress) -> u256 {
            let bal = self.staker_balance.entry((token, staker)).read();
            let rpt = self.reward_per_token_stored.entry(token).read();
            let snap = self.user_reward_snapshot.entry((token, staker)).read();
            let pending = self.pending_rewards.entry((token, staker)).read();
            pending + bal * (rpt - snap) / PRECISION
        }

        fn total_fees_deposited(self: @ContractState, token: ContractAddress) -> u256 {
            self.total_fees_deposited.entry(token).read()
        }

        fn swap_address(self: @ContractState) -> ContractAddress {
            self.swap.read()
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        /// Update reward-per-token accumulator and record total fees.
        fn _accumulate_reward(ref self: ContractState, token: ContractAddress, strk_amount: u256) {
            let total = self.total_staked.entry(token).read();
            if total > 0 {
                let rpt = self.reward_per_token_stored.entry(token).read();
                let delta = strk_amount * PRECISION / total;
                let new_rpt = rpt + delta;
                self.reward_per_token_stored.entry(token).write(new_rpt);
                self.emit(FeesDeposited { token, amount: strk_amount, new_reward_per_token: new_rpt });
            }
            let prev = self.total_fees_deposited.entry(token).read();
            self.total_fees_deposited.entry(token).write(prev + strk_amount);
        }

        /// Settle all pending rewards for `staker` before any balance change.
        fn _update_rewards(ref self: ContractState, token: ContractAddress, staker: ContractAddress) {
            let rpt = self.reward_per_token_stored.entry(token).read();
            let snap = self.user_reward_snapshot.entry((token, staker)).read();
            let bal = self.staker_balance.entry((token, staker)).read();
            let new_earned = bal * (rpt - snap) / PRECISION;
            let prev_pending = self.pending_rewards.entry((token, staker)).read();
            self.pending_rewards.entry((token, staker)).write(prev_pending + new_earned);
            self.user_reward_snapshot.entry((token, staker)).write(rpt);
        }
    }

    /// Owner can update the authorised Swap address (in case of upgrade).
    #[abi(embed_v0)]
    impl AdminImpl of IAdmin<ContractState> {
        fn set_swap(ref self: ContractState, new_swap: ContractAddress) {
            self.ownable.assert_only_owner();
            self.swap.write(new_swap);
        }
    }

    #[starknet::interface]
    pub trait IAdmin<TContractState> {
        fn set_swap(ref self: TContractState, new_swap: ContractAddress);
    }
}
