#[starknet::contract]
pub mod dutch_auction {
    use super::super::{Bid, AuctionCreated, AuctionBid, ConfigUpdated, DutchAuctionSetters};
    use starknet::{
        storage::{StoragePointerReadAccess, StoragePointerWriteAccess}, ContractAddress,
        get_caller_address, get_contract_address, get_block_timestamp, ClassHash,
    };
    use crate::factory::{ShinterfaceDispatcher, ShinterfaceDispatcherTrait};
    use openzeppelin_access::ownable::OwnableComponent;
    use openzeppelin_interfaces::{
        erc20::{IERC20Dispatcher, IERC20DispatcherTrait},
        upgrades::IUpgradeable,
    };
    use openzeppelin_upgrades::UpgradeableComponent;
    use cubit::f256::{Fixed, FixedTrait, FixedPrint};

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
        AuctionCreated: AuctionCreated,
        AuctionBid: AuctionBid,
        ConfigUpdated: ConfigUpdated,
    }


    #[storage]
    struct Storage {
        /// Start price of the auction. If someone bids the next start price will be 2x the price he
        /// paid.
        pub start_price: u256,
        /// Kinda always fixed but can be modified by the greedy admin. If an auction expires the
        /// start price will be the end price and you guessed it the auction price will not move at
        /// all and will be constant during the whole auction.
        pub end_price: u256,
        /// Start timestamp of the auction.
        pub start_timestamp: u64,
        /// Duration of the auction, this should be constant but can once again be modified by the
        /// greedy admin and it won't break this awesome contract because nothing is hardcoded B)
        /// (this is a cool smiley)
        pub duration: u64,
        /// Did someone pay for the auction. This should always be false as when someone bids it
        /// automatically creates a new auction hence it resets it to false but we never know in
        /// case of a bug.
        pub closed: bool,
        /// STRK token address.
        pub strk: IERC20Dispatcher,
        /// Our great token factory.
        pub factory: ShinterfaceDispatcher,
        /// A straight line is defined as y = a * x + b and you guessed it this is the `a`
        /// coefficient.
        pub a: Fixed,
        /// See above this is b.
        pub b: Fixed,
        /// Treasury of the greedy admin so he can steal your money.
        pub treasury: ContractAddress,
        #[substorage(v0)]
        /// Greedy admin wallet don't hesitate to scam him i'll leave his physical address when we
        /// deploy it.
        ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        /// Upgradable so the greedy admin can rug.
        upgradeable: UpgradeableComponent::Storage,
    }
    #[constructor]
    fn constructor(
        ref self: ContractState,
        start_price: u256,
        end_price: u256,
        start_timestamp: u64,
        duration: u64,
        strk: IERC20Dispatcher,
        factory: ShinterfaceDispatcher,
        treasury: ContractAddress,
        owner: ContractAddress,
    ) {
        self.start_price.write(start_price);
        self.end_price.write(end_price);
        self.start_timestamp.write(get_block_timestamp());
        self.closed.write(true);
        self.duration.write(duration);
        self.create_auction(start_timestamp, start_price);
        self.strk.write(strk);
        self.factory.write(factory);
        self.treasury.write(treasury);
        self.ownable.initializer(owner);
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
    impl Bimpl of Bid<ContractState> {
        fn create_auction(ref self: ContractState, start_time: u64, start_price: u256) {
            let start_timestamp = self.start_timestamp.read();
            let current_timestamp = get_block_timestamp();
            let duration = self.duration.read();

            // closed should always be false here as when someone bids it creates a new auction and
            // resets closed to false.
            // This case is when an auction failed
            let is_auction_expired = start_timestamp
                + duration < current_timestamp && !self.closed.read();
            // This case is when an auction succeded.
            let is_auction_fulfilled = self.closed.read()
                && current_timestamp >= start_timestamp
                && current_timestamp <= start_timestamp
                + duration;
            assert!(!is_auction_fulfilled || !is_auction_expired, "Auction still not finished");
            let start_price = if is_auction_expired {
                self.end_price.read()
            } else {
                start_price
            };
            // get the slope
            let a = FixedTrait::new_unscaled(start_price - self.end_price.read(), true);
            let a = a / FixedTrait::new_unscaled(duration.into(), false);
            // Get the offset
            let b = FixedTrait::new_unscaled(start_price, false)
                - a * FixedTrait::new_unscaled(start_timestamp.into(), false);
            self.a.write(a);
            self.b.write(b);
            self.closed.write(false);
            self.start_timestamp.write(start_time);
            self.start_price.write(start_price);

            self
                .emit(
                    AuctionCreated {
                        start_time, start_price, end_price: self.end_price.read(), duration,
                    },
                );
        }
        fn current_price(self: @ContractState) -> u256 {
            let x = FixedTrait::new_unscaled(get_block_timestamp().into(), false);
            (self.a.read() * x + self.b.read()).try_into().unwrap()
        }
        fn bid(
            ref self: ContractState, name: ByteArray, symbol: ByteArray, sniping: u256,
        ) -> ContractAddress {
            let start_timestamp = self.start_timestamp.read();
            let current_timestamp = get_block_timestamp();
            assert!(start_timestamp <= current_timestamp, "Auction not started");
            assert!(
                start_timestamp + self.duration.read() > current_timestamp && !self.closed.read(),
                "Auction expired",
            );
            // This should never happen as a new one is created right after the bid
            assert!(!self.closed.read(), "Can't bid, auction already finished");
            self.closed.write(true);
            let caller = get_caller_address();
            let self_address = get_contract_address();
            let strk = self.strk.read();
            let factory = self.factory.read();
            let current_price = self.current_price();
            let fees = sniping / 100;
            strk.transfer_from(caller, self_address, current_price);
            if sniping > 0 {
                strk.transfer_from(caller, self_address, sniping);
            }
            strk.approve(factory.contract_address, sniping + fees);
            let token_address = factory.launshitcoin(caller, name, symbol, sniping + fees);
            strk.transfer(self.treasury.read(), strk.balance_of(self_address));

            self.emit(AuctionBid { bidder: caller, price: current_price, sniping, token_address });

            self
                .create_auction(
                    self.start_timestamp.read() + self.duration.read(), 2 * current_price,
                );
            token_address
        }
    }

    #[abi(embed_v0)]
    impl DutchAuctionSettersImpl of DutchAuctionSetters<ContractState> {
        fn set_end_price(ref self: ContractState, new_end_price: u256) {
            self.ownable.assert_only_owner();
            self.end_price.write(new_end_price);
            self
                .emit(
                    ConfigUpdated {
                        parameter: "end_price", value: new_end_price.try_into().unwrap(),
                    },
                );
        }

        fn set_duration(ref self: ContractState, new_duration: u64) {
            self.ownable.assert_only_owner();
            self.duration.write(new_duration);
            self.emit(ConfigUpdated { parameter: "duration", value: new_duration.into() });
        }

        fn set_treasury(ref self: ContractState, new_treasury: ContractAddress) {
            self.ownable.assert_only_owner();
            self.treasury.write(new_treasury);
            self.emit(ConfigUpdated { parameter: "treasury", value: new_treasury.into() });
        }

        fn set_factory(ref self: ContractState, new_factory: ShinterfaceDispatcher) {
            self.ownable.assert_only_owner();
            self.factory.write(new_factory);
            self
                .emit(
                    ConfigUpdated {
                        parameter: "factory", value: new_factory.contract_address.into(),
                    },
                );
        }

        fn set_strk(ref self: ContractState, new_strk: IERC20Dispatcher) {
            self.ownable.assert_only_owner();
            self.strk.write(new_strk);
            self.emit(ConfigUpdated { parameter: "strk", value: new_strk.contract_address.into() });
        }
    }
}
