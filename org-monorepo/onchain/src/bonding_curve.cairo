#[starknet::interface]
pub trait BondingPrice<TContractState> {
    fn buy(self: @TContractState, market_cap: u128, buy: u128) -> u128;
    fn sell(self: @TContractState, market_cap: u128, tokens: u128) -> u128;
}

#[starknet::contract]
pub mod bonding_curve {
    use core::starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use cubit::f128::{Fixed, FixedTrait, FixedPrint};

    #[storage]
    struct Storage {
        a: Fixed,
        k: Fixed,
        precomputed_a: Fixed,
    }
    #[constructor]
    fn constructor(ref self: ContractState, a: Fixed, k: Fixed) {
        self.a.write(a);
        self.k.write(k);
        let precomputed_a = FixedTrait::new(0x9896800000000000000000, false) / (k * a);
        self.precomputed_a.write(precomputed_a);
    }

    #[abi(embed_v0)]
    impl Price of super::BondingPrice<ContractState> {
        fn buy(self: @ContractState, market_cap: u128, buy: u128) -> u128 {
            let buy = FixedTrait::new_unscaled(buy, false);
            let M0 = FixedTrait::new_unscaled(market_cap, false);
            let M1 = M0 + buy;
            let neg_a = -self.a.read();
            let N = self.precomputed_a.read() * ((neg_a * M0).exp() - (neg_a * M1).exp());
            N.try_into().unwrap_or_default()
        }
        fn sell(self: @ContractState, market_cap: u128, tokens: u128) -> u128 {
            let a = self.a.read();
            let sell = FixedTrait::new_unscaled(tokens, false);
            let mcap = FixedTrait::new_unscaled(market_cap, false);
            let exp_a_mcap = (mcap * a).exp();
            let strk = ((sell * exp_a_mcap / self.precomputed_a.read()) + FixedTrait::ONE()).ln()
                / a;
            strk.try_into().unwrap_or_default()
        }
    }
}
