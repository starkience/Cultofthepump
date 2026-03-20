use openzeppelin_token::erc20::interface::IERC20Dispatcher;
use starknet::ContractAddress;

#[starknet::interface]
pub trait Trade<TContractState> {
    fn buy(ref self: TContractState, strk: u256, token: IERC20Dispatcher);
    fn sell(ref self: TContractState, amount: u256, token: IERC20Dispatcher);
}

#[starknet::interface]
pub trait SwapSetters<TContractState> {
    fn set_strk_price(ref self: TContractState, token: ContractAddress, price: u128);
}

#[starknet::contract]
mod swap {
    use onchain::bonding_curve::{BondingPriceDispatcher, BondingPriceDispatcherTrait};
    use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess, StoragePathEntry, Map,
    };
    use starknet::{ContractAddress, get_caller_address, get_contract_address};


    #[storage]
    struct Storage {
        /// Bonding curve contract dispatcher to get the amount of token for the trading order.
        pub bonding_curve: BondingPriceDispatcher,
        /// Stark token contract.
        pub strk_contract: IERC20Dispatcher,
        /// Address that receives the fees
        pub treasury: ContractAddress,
        /// The strk price is set for a token when creating it.
        pub strk_prices: Map<ContractAddress, u128>,
        /// All the tokens market caps.
        pub market_caps: Map<ContractAddress, u128>,
    }
    #[constructor]
    fn constructor(
        ref self: ContractState,
        strk_contract: IERC20Dispatcher,
        bonding_curve: BondingPriceDispatcher,
        treasury: ContractAddress,
    ) {
        self.strk_contract.write(strk_contract);
        self.bonding_curve.write(bonding_curve);
        self.treasury.write(treasury);
    }

    #[abi(embed_v0)]
    impl Tradeable of super::Trade<ContractState> {
        /// Buy the given token. Transfers the fees to the treasury and the remaining funds to the
        /// bought token contract.
        ///
        /// # Arguments
        ///
        /// * `strk` - Amount of strk to spend.
        /// * `token` - The token to buy.
        fn buy(ref self: ContractState, strk: u256, token: IERC20Dispatcher) {
            let caller = get_caller_address();
            let strk_contract = self.strk_contract.read();
            let strk_price = self.strk_prices.entry(token.contract_address).read();

            let fees = strk / 100;
            let buy = strk - fees;
            let market_cap_entry = self.market_caps.entry(token.contract_address);
            let market_cap = market_cap_entry.read();
            strk_contract.transfer_from(caller, self.treasury.read(), fees);
            strk_contract.transfer_from(caller, get_contract_address(), buy);

            let buy_dollar: u128 = ((buy * strk_price.into()) / 100)
                .try_into()
                .expect('Too much strk in buy order');

            market_cap_entry.write(market_cap + buy_dollar);

            let tokens = self.bonding_curve.read().buy(:market_cap, buy: buy_dollar);

            token.transfer(caller, u256 { low: tokens, high: 0 });
        }

        fn sell(ref self: ContractState, amount: u256, token: IERC20Dispatcher) {
            let caller = get_caller_address();
            let strk_contract = self.strk_contract.read();
            let strk_price = self.strk_prices.entry(token.contract_address).read();
            token.transfer_from(caller, get_contract_address(), amount);
            let market_cap_entry = self.market_caps.entry(token.contract_address);
            let market_cap = market_cap_entry.read();
            let dollars = self
                .bonding_curve
                .read()
                .sell(:market_cap, tokens: amount.try_into().expect('Selling too many tokens'));

            let strk = (dollars * 100 / strk_price);
            let fees = strk / 100;
            let rest = strk - fees;
            strk_contract.transfer(self.treasury.read(), u256 { low: fees, high: 0 });
            strk_contract.transfer(caller, u256 { low: rest, high: 0 });
            market_cap_entry.write(market_cap - dollars);
        }
    }

    #[abi(embed_v0)]
    impl SwapSettersImpl of super::SwapSetters<ContractState> {
        fn set_strk_price(ref self: ContractState, token: ContractAddress, price: u128) {
            self.strk_prices.entry(token).write(price);
        }
    }
}
