#[starknet::contract]
pub mod factory {
    use core::pedersen::pedersen;
    use crate::swap::{TradeDispatcher, TradeDispatcherTrait};
    use openzeppelin_access::ownable::OwnableComponent;
    use openzeppelin_interfaces::{
        erc20::{IERC20Dispatcher, IERC20DispatcherTrait},
        upgrades::IUpgradeable,
    };
    use openzeppelin_upgrades::UpgradeableComponent;
    use super::super::{ShitcoinLaunched, FactoryConfigured, ConfigUpdated, Shinterface};
    use starknet::{
        class_hash::ClassHash, storage::{StoragePointerReadAccess, StoragePointerWriteAccess},
        syscalls::deploy_syscall, get_contract_address, get_caller_address, ContractAddress,
        get_block_timestamp,
    };

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        ShitcoinLaunched: ShitcoinLaunched,
        FactoryConfigured: FactoryConfigured,
        ConfigUpdated: ConfigUpdated,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
    }


    // Upgradable
    #[storage]
    struct Storage {
        shitcoin_class_hash: ClassHash,
        swap: TradeDispatcher,
        strk: IERC20Dispatcher,
        treasury: ContractAddress,
        dutch_auction: ContractAddress,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        shitcoin_class_hash: ClassHash,
        swap: TradeDispatcher,
        strk: IERC20Dispatcher,
        treasury: ContractAddress,
        owner: ContractAddress,
    ) {
        self.shitcoin_class_hash.write(shitcoin_class_hash);
        self.swap.write(swap);
        self.strk.write(strk);
        self.treasury.write(treasury);
        self.ownable.initializer(owner);

        // Emit configuration event
        self
            .emit(
                FactoryConfigured {
                    shitcoin_class_hash,
                    swap: swap.contract_address,
                    strk: strk.contract_address,
                    treasury,
                },
            );
    }

    /// Ownable
    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    /// Upgradeable
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            self.ownable.assert_only_owner();
            self.upgradeable.upgrade(new_class_hash);
        }
    }

    #[abi(embed_v0)]
    impl Shimplementation of Shinterface<ContractState> {
        fn launshitcoin(
            ref self: ContractState,
            user: ContractAddress,
            shit_name: ByteArray,
            shit_symbol: ByteArray,
            initial_shniping: u256,
        ) -> ContractAddress {
            let caller = get_caller_address();
            assert!(caller == self.dutch_auction.read());
            let swap = self.swap.read();
            let strk = self.strk.read();
            strk.transfer_from(caller, get_contract_address(), initial_shniping);
            let mut constructor_calldata = array![];

            shit_name.serialize(ref constructor_calldata);
            shit_symbol.serialize(ref constructor_calldata);
            1_000_000_000_000_000_000_000_000_000_u256.serialize(ref constructor_calldata);
            swap.contract_address.serialize(ref constructor_calldata);
            let (shitcoin_address, _) = deploy_syscall(
                self.shitcoin_class_hash.read(),
                pedersen(caller.into(), get_block_timestamp().into()),
                constructor_calldata.span(),
                true,
            )
                .unwrap();
            let token_shitspatcher = IERC20Dispatcher { contract_address: shitcoin_address };
            let pile_of_shit = if initial_shniping > 0 {
                strk.approve(swap.contract_address, initial_shniping);
                let pile_of_shit = swap.buy(initial_shniping, token_shitspatcher);
                token_shitspatcher.transfer(user, pile_of_shit);
                pile_of_shit
            } else {
                0
            };

            // Emit launch event
            self
                .emit(
                    ShitcoinLaunched {
                        shitcoin_address,
                        creator: user,
                        name: shit_name,
                        symbol: shit_symbol,
                        initial_shniping,
                        pile_of_shit,
                    },
                );

            shitcoin_address
        }

        fn set_shitcoin_class_hash(ref self: ContractState, new_class_hash: ClassHash) {
            self.ownable.assert_only_owner();
            self.shitcoin_class_hash.write(new_class_hash);
            self
                .emit(
                    ConfigUpdated {
                        parameter: "shitcoin_class_hash", value: new_class_hash.into(),
                    },
                );
        }

        fn set_swap(ref self: ContractState, new_swap: ContractAddress) {
            self.ownable.assert_only_owner();
            self.swap.write(TradeDispatcher { contract_address: new_swap });
            self.emit(ConfigUpdated { parameter: "swap", value: new_swap.into() });
        }

        fn set_treasury(ref self: ContractState, new_treasury: ContractAddress) {
            self.ownable.assert_only_owner();
            self.treasury.write(new_treasury);
            self.emit(ConfigUpdated { parameter: "treasury", value: new_treasury.into() });
        }

        fn set_dutch_auction(ref self: ContractState, new_dutch_auction: ContractAddress) {
            self.ownable.assert_only_owner();
            self.dutch_auction.write(new_dutch_auction);
            self
                .emit(
                    ConfigUpdated { parameter: "dutch_auction", value: new_dutch_auction.into() },
                );
        }
    }
}
