#[starknet::interface]
pub trait BondingPrice<TContractState> {
    /// This very practical function will tell you how many tokens you can get given an amount of
    /// STRK you send and the current market cap of the very not shitty token.
    fn buy(self: @TContractState, market_cap: u256, buy: u256) -> u256;
    /// This very practical function will tell you how many STRK you can get given an amount of
    /// very not shitty token you send and the current market cap of the very not shitty token.
    fn sell(self: @TContractState, market_cap: u256, tokens: u256) -> u256;
}
