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
    /// Set the staking contract address. Zero address disables staking fee split.
    fn set_staking(ref self: TContractState, staking: ContractAddress);
    /// Set the share of fees that go to stakers, in basis points (0–10000).
    /// Default 10000 = 100% of fees to stakers.
    fn set_staking_fee_bps(ref self: TContractState, bps: u128);
}
