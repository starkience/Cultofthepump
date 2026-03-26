#[starknet::contract]
pub mod swap {
    use crate::bonding_curve::{BondingPriceDispatcher, BondingPriceDispatcherTrait};
    use crate::staking::{ICultStakingDispatcher, ICultStakingDispatcherTrait};
    use ekubo::{
        interfaces::{
            core::{ICoreDispatcher, ICoreDispatcherTrait},
            erc20::{IERC20Dispatcher as EkuboERC20Dispatcher},
            positions::{IPositionsDispatcher, IPositionsDispatcherTrait},
            token_registry::{ITokenRegistryDispatcher, ITokenRegistryDispatcherTrait},
        },
        types::{bounds::Bounds, i129::i129, keys::PoolKey},
    };

    use openzeppelin_access::ownable::OwnableComponent;
    use openzeppelin_interfaces::{
        erc20::{IERC20Dispatcher, IERC20DispatcherTrait},
        upgrades::IUpgradeable,
    };
    use openzeppelin_upgrades::UpgradeableComponent;
    use starknet::{
        storage::{StoragePointerReadAccess, StoragePointerWriteAccess, StoragePathEntry, Map},
        ContractAddress, get_caller_address, get_contract_address, contract_address_const,
        ClassHash,
    };
    use super::super::{TokenBought, TokenSold, PoolLaunched, ConfigUpdated, Trade, SwapSetters};

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);

    /// Ownable
    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    /// Upgradeable
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;


    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        TokenBought: TokenBought,
        TokenSold: TokenSold,
        PoolLaunched: PoolLaunched,
        ConfigUpdated: ConfigUpdated,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
    }


    /// 10 ** 18
    const STRK_DECIMALS: u128 = 1000000000000000000;

    #[storage]
    struct Storage {
        /// Contract that implements the bonding curve pricing algorithm.
        /// Used to calculate token amounts based on market cap changes.
        pub bonding_curve: BondingPriceDispatcher,
        /// The STRK token contract used for payments.
        /// All buys and sells are priced in STRK.
        pub strk_contract: IERC20Dispatcher,
        /// Max market cap before launching a pool on the dex
        pub strk_amount: u256,
        /// Address that collects the fee from all trades.
        /// Fees are collected in STRK for both buys and sells.
        pub treasury: ContractAddress,
        /// Market cap (in STRK) of each token
        pub market_caps: Map<ContractAddress, u256>,
        /// The Ekubo DEX core contract used for creating liquidity pools.
        /// Called when launching new token pairs.
        pub ekubo_core: ICoreDispatcher,
        /// The Ekubo DEX registry contract used for registering tokens.
        pub ekubo_registry: ITokenRegistryDispatcher,
        /// The Ekubo DEX positions contract used for managing liquidity positions.
        pub ekubo_positions: IPositionsDispatcher,
        /// Initial price tick for Ekubo liquidity pools.
        /// Used when initializing new token/STRK pairs.
        pub starting_tick: i129,
        /// Fee percentage charged on trades (in basis points).
        /// Example: 100 means 1% fee
        pub fees: u128,
        /// Factory contract address that can set token prices
        pub factory: ContractAddress,
        /// CultStaking contract address. Zero = staking disabled.
        pub staking: ContractAddress,
        /// Basis points of fees sent to stakers (0–10000). Default 10000 = 100%.
        pub staking_fee_bps: u128,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        strk_contract: IERC20Dispatcher,
        bonding_curve: BondingPriceDispatcher,
        treasury: ContractAddress,
        ekubo_core: ICoreDispatcher,
        ekubo_registry: ITokenRegistryDispatcher,
        ekubo_positions: IPositionsDispatcher,
        owner: ContractAddress,
        factory: ContractAddress,
    ) {
        self.strk_contract.write(strk_contract);
        self.bonding_curve.write(bonding_curve);
        self.treasury.write(treasury);
        self.ekubo_core.write(ekubo_core);
        self.ekubo_registry.write(ekubo_registry);
        self.ekubo_positions.write(ekubo_positions);
        self.starting_tick.write(i129 { sign: true, mag: 34182119 });
        self.fees.write(100); // Default 1% fee
        self.factory.write(factory);
        self.staking.write(contract_address_const::<0>());
        self.staking_fee_bps.write(10000); // 100% of fees → stakers by default
        self.ownable.initializer(owner);
        self.strk_amount.write(101010);
    }

    #[abi(embed_v0)]
    impl Tradeable of Trade<ContractState> {
        /// Buy the given token with STRK. The function:
        /// 1. Checks if there are enough tokens available
        /// 2. Takes fee in STRK which goes to treasury
        /// 3. Transfers remaining STRK to this contract
        /// 4. Calculates tokens based on bonding curve and market cap
        /// 5. Transfers tokens to buyer
        /// 6. Updates the market cap
        ///
        /// # Arguments
        ///
        /// * `strk` - Amount of STRK to spend
        /// * `token` - The token contract to buy
        ///
        /// # Returns
        ///
        /// * `u256` - The amount of tokens received by the buyer
        fn buy(ref self: ContractState, strk: u256, token: IERC20Dispatcher) -> u256 {
            assert!(strk > 0, "STRK amount cannot be 0");

            let caller = get_caller_address();
            let self_address = get_contract_address();

            if token.balance_of(self_address) == 0 {
                panic!("All tokens are sold");
            }

            let remaining_tokens = token.balance_of(self_address)
                - 200_000_001_000_000_000_000_000_000;
            let strk_contract = self.strk_contract.read();
            let fees = strk / self.fees.read().into();
            let buy = strk - fees;
            let market_cap_entry = self.market_caps.entry(token.contract_address);
            let market_cap = market_cap_entry.read();

            let staking_addr = self.staking.read();
            let zero_address = starknet::contract_address_const::<0>();
            if staking_addr != zero_address {
                let staking_bps: u256 = self.staking_fee_bps.read().into();
                let staking_fees = fees * staking_bps / 10000_u256;
                let treasury_fees = fees - staking_fees;
                if treasury_fees > 0 {
                    strk_contract.transfer_from(caller, self.treasury.read(), treasury_fees);
                }
                if staking_fees > 0 {
                    strk_contract.transfer_from(caller, staking_addr, staking_fees);
                    ICultStakingDispatcher { contract_address: staking_addr }
                        .notify_reward(token.contract_address, staking_fees);
                }
            } else {
                strk_contract.transfer_from(caller, self.treasury.read(), fees);
            }
            strk_contract.transfer_from(caller, self_address, buy);

            let new_market_cap = market_cap + buy;
            market_cap_entry.write(new_market_cap);

            let tokens = self.bonding_curve.read().buy(:market_cap, :buy);

            let transfer_amount = if remaining_tokens < tokens {
                self.launch_on_dex(token);
                remaining_tokens
            } else {
                tokens
            };

            token.transfer(caller, transfer_amount.into());

            // Emit event
            self
                .emit(
                    TokenBought {
                        token: token.contract_address,
                        buyer: caller,
                        strk_amount: strk,
                        token_amount: transfer_amount,
                        market_cap: new_market_cap,
                        fees,
                    },
                );

            transfer_amount
        }

        /// Sell the given token for STRK. The function:
        /// 1. Transfers the tokens from seller to this contract
        /// 2. Calculates the STRK amount based on bonding curve and STRK price
        /// 3. Takes fee which goes to treasury
        /// 4. Transfers remaining STRK to seller
        /// 5. Updates the market cap
        ///
        /// # Arguments
        ///
        /// * `amount` - Amount of tokens to sell
        /// * `token` - The token contract to sell
        ///
        /// # Returns
        ///
        /// * `u256` - The amount of STRK received by the seller (after fees)
        fn sell(ref self: ContractState, amount: u256, token: IERC20Dispatcher) -> u256 {
            assert!(amount > 0, "Amount cannot be 0");

            let caller = get_caller_address();
            let strk_contract = self.strk_contract.read();

            token.transfer_from(caller, get_contract_address(), amount.into());

            let market_cap_entry = self.market_caps.entry(token.contract_address);
            let market_cap = market_cap_entry.read();

            let strk = self.bonding_curve.read().sell(:market_cap, tokens: amount);

            let fees = strk / self.fees.read().into();
            let rest = strk - fees;

            let staking_addr = self.staking.read();
            let zero_address = starknet::contract_address_const::<0>();
            if staking_addr != zero_address {
                let staking_bps: u256 = self.staking_fee_bps.read().into();
                let staking_fees = fees * staking_bps / 10000_u256;
                let treasury_fees = fees - staking_fees;
                if treasury_fees > 0 {
                    strk_contract.transfer(self.treasury.read(), treasury_fees);
                }
                if staking_fees > 0 {
                    strk_contract.transfer(staking_addr, staking_fees);
                    ICultStakingDispatcher { contract_address: staking_addr }
                        .notify_reward(token.contract_address, staking_fees);
                }
            } else {
                strk_contract.transfer(self.treasury.read(), fees);
            }
            strk_contract.transfer(caller, rest);

            market_cap_entry.write(market_cap - rest);

            // Emit event
            self
                .emit(
                    TokenSold {
                        token: token.contract_address,
                        seller: caller,
                        token_amount: amount,
                        strk_amount: rest,
                        market_cap: market_cap - rest,
                        fees: fees,
                    },
                );

            rest
        }
    }

    #[generate_trait]
    impl EkuboLauncher of EkuboLaunch {
        fn launch_on_dex(ref self: ContractState, token: IERC20Dispatcher) {
            let strk = self.strk_contract.read();
            let (token0, token1) = if Into::<
                felt252, u256,
                >::into(Into::<ContractAddress, felt252>::into(token.contract_address)) < Into::<
                felt252, u256,
            >::into(Into::<ContractAddress, felt252>::into(strk.contract_address)) {
                (token.contract_address, strk.contract_address)
            } else {
                (strk.contract_address, token.contract_address)
            };

            // Register token with Ekubo registry
            token.transfer(self.ekubo_registry.read().contract_address, 1000000000000000000);
            self
                .ekubo_registry
                .read()
                .register_token(EkuboERC20Dispatcher { contract_address: token.contract_address });
            let tick_spacing = 5982; // looked good in the unruggable code.
            let fee = 0xc49ba5e353f7d00000000000000000; // 1% (1/100 * 2**128)
            let pool_key = PoolKey {
                token0, token1, fee, tick_spacing, extension: contract_address_const::<0>(),
            };

            // Initialize pool

            // Send tokens to positions contract and mint deposit
            let ekubo_positions = self.ekubo_positions.read();
            let (starting_tick, bounds) = if token1 == strk.contract_address {
                // If token1 is STRK (quote), use positive ticks
                (
                    self.starting_tick.read(),
                    Bounds {
                        lower: i129 { sign: true, mag: 88719042 },
                        upper: i129 { sign: false, mag: 88719042 },
                    },
                )
            } else {
                let real_starting_tick = self.starting_tick.read();
                // If token1 is not STRK (quote), use negative ticks
                (
                    i129 { sign: real_starting_tick.sign, mag: real_starting_tick.mag },
                    Bounds {
                        lower: i129 { sign: true, mag: 88719042 },
                        upper: i129 { sign: false, mag: 88719042 },
                    },
                )
            };

            let _ = self.ekubo_core.read().maybe_initialize_pool(pool_key, starting_tick);
            token.transfer(ekubo_positions.contract_address, 200_000_000_000_000_000_000_000_000);
            strk.transfer(ekubo_positions.contract_address, self.strk_amount.read().into());
            let (id, _liq, _amount1, _amount2) = ekubo_positions
                .mint_and_deposit_and_clear_both(pool_key, bounds, 527570059929121);
            // let liquidity = self.ekubo_core.read().get_pool_liquidity(pool_key);
            // println!("Liq {liquidity}");
            ekubo_positions.unsafe_burn(id);

            // Emit event
            self
                .emit(
                    PoolLaunched {
                        token: token.contract_address, token0, token1, tick_spacing, fee,
                    },
                );
        }
    }
    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            // This function can only be called by the owner
            self.ownable.assert_only_owner();

            // Replace the class hash upgrading the contract
            self.upgradeable.upgrade(new_class_hash);
        }
    }

    #[abi(embed_v0)]
    impl SwapSettersImpl of SwapSetters<ContractState> {
        fn set_bonding_curve(ref self: ContractState, bonding_curve: BondingPriceDispatcher) {
            self.ownable.assert_only_owner();
            self.bonding_curve.write(bonding_curve);

            // Emit event
            self
                .emit(
                    ConfigUpdated {
                        parameter: "bonding_curve", value: bonding_curve.contract_address.into(),
                    },
                );
        }

        fn set_treasury(ref self: ContractState, treasury: ContractAddress) {
            self.ownable.assert_only_owner();
            self.treasury.write(treasury);

            // Emit event
            self.emit(ConfigUpdated { parameter: "treasury", value: treasury.into() });
        }

        fn set_strk_amount(ref self: ContractState, strk_amount: u256) {
            self.ownable.assert_only_owner();
            self.strk_amount.write(strk_amount);

            // Emit event
            self
                .emit(
                    ConfigUpdated {
                        parameter: "strk_amount", value: strk_amount.try_into().unwrap(),
                    },
                );
        }

        fn set_starting_tick(ref self: ContractState, tick: i129) {
            self.ownable.assert_only_owner();
            self.starting_tick.write(tick);

            // Emit event
            self.emit(ConfigUpdated { parameter: "starting_tick", value: tick.mag.into() });
        }

        fn set_fees(ref self: ContractState, fees: u128) {
            self.ownable.assert_only_owner();
            self.fees.write(fees);

            // Emit event
            self.emit(ConfigUpdated { parameter: "fees", value: fees.into() });
        }

        fn set_factory(ref self: ContractState, factory: ContractAddress) {
            self.ownable.assert_only_owner();
            self.factory.write(factory);

            // Emit event
            self.emit(ConfigUpdated { parameter: "factory", value: factory.into() });
        }

        fn set_staking(ref self: ContractState, staking: ContractAddress) {
            self.ownable.assert_only_owner();
            self.staking.write(staking);

            // Emit event
            self.emit(ConfigUpdated { parameter: "staking", value: staking.into() });
        }

        fn set_staking_fee_bps(ref self: ContractState, bps: u128) {
            self.ownable.assert_only_owner();
            assert!(bps <= 10000, "bps cannot exceed 10000");
            self.staking_fee_bps.write(bps);

            // Emit event
            self.emit(ConfigUpdated { parameter: "staking_fee_bps", value: bps.into() });
        }
    }
}
