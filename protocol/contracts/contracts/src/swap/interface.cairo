use crate::bonding_curve::BondingPriceDispatcher;
use ekubo::types::i129::i129;
use openzeppelin_interfaces::erc20::IERC20Dispatcher;
use starknet::ContractAddress;

#[starknet::interface]
pub trait Trade<TContractState> {
    fn buy(ref self: TContractState, strk: u256, token: IERC20Dispatcher) -> u256;
    fn sell(ref self: TContractState, amount: u256, token: IERC20Dispatcher) -> u256;
}

#[starknet::interface]
pub trait SwapSetters<TContractState> {
    fn set_bonding_curve(ref self: TContractState, bonding_curve: BondingPriceDispatcher);
    fn set_treasury(ref self: TContractState, treasury: ContractAddress);
    fn set_strk_amount(ref self: TContractState, strk_amount: u256);
    fn set_starting_tick(ref self: TContractState, tick: i129);
    fn set_fees(ref self: TContractState, fees: u128);
    fn set_factory(ref self: TContractState, factory: ContractAddress);
}
