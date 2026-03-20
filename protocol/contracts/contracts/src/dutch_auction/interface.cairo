use crate::factory::ShinterfaceDispatcher;
use starknet::ContractAddress;
use openzeppelin_interfaces::erc20::IERC20Dispatcher;

#[starknet::interface]
pub trait Bid<TContractState> {
    /// Creates a new auction. If the previous auction is expired will ignore the start price and
    /// use the end price as start price.
    fn create_auction(ref self: TContractState, start_time: u64, start_price: u256);
    /// Allows a user to bid. If he is the first one he will win the auction and deploy his amazing
    /// token with the provided name and symbol. We even allow him to snipe his own token so he can
    /// get flithy rich.
    fn bid(
        ref self: TContractState, name: ByteArray, symbol: ByteArray, sniping: u256,
    ) -> ContractAddress;
    /// Current price of the auction in strk.
    fn current_price(self: @TContractState) -> u256;
}


#[starknet::interface]
/// Setters for the Dutch auction contract as the trait name suggests nothing crazy.
pub trait DutchAuctionSetters<TContractState> {
    fn set_end_price(ref self: TContractState, new_end_price: u256);
    fn set_duration(ref self: TContractState, new_duration: u64);
    fn set_treasury(ref self: TContractState, new_treasury: ContractAddress);
    fn set_factory(ref self: TContractState, new_factory: ShinterfaceDispatcher);
    fn set_strk(ref self: TContractState, new_strk: IERC20Dispatcher);
}
