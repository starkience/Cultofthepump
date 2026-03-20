#[starknet::contract]
pub mod bonding_curve {
    use core::starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use cubit::f256::{Fixed, FixedTrait, FixedPrint};
    use super::super::{BondingCurveInitialized, BondingPrice};

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        BondingCurveInitialized: BondingCurveInitialized,
    }


    #[storage]
    struct Storage {
        /// The bonding curve equation is of the form k * exp(a * n)
        a: Fixed,
        /// The bonding curve equation is of the form k * exp(a * n)
        k: Fixed,
        /// This is to avoid computing the same value at every call of the functions. This is
        /// automatically computed in the constructor given k and a.
        precomputed_a: Fixed,
    }

    #[constructor]
    fn constructor(ref self: ContractState, a: Fixed, k: Fixed) {
        self.a.write(a);
        self.k.write(k);
        // 10_000_000 / (k * a)
        let precomputed_a = FixedTrait::new(0x98968000000000000000000000000000000000, false) / a;
        let precomputed_a = precomputed_a / k;
        self.precomputed_a.write(precomputed_a);
        self.emit(BondingCurveInitialized { a, k });
    }

    #[abi(embed_v0)]
    impl Price of BondingPrice<ContractState> {
        fn buy(self: @ContractState, market_cap: u256, buy: u256) -> u256 {
            let buy_fixed = FixedTrait::new_unscaled(buy, false);
            // Left bound
            let M0 = FixedTrait::new_unscaled(market_cap, false);
            // Right bound
            let M1 = M0 + buy_fixed;
            let neg_a = -self.a.read();
            // Integral of our bounding curve function
            let N = self.precomputed_a.read() * ((neg_a * M0).exp() - (neg_a * M1).exp());
            // Ceil otherwise when you buy and then sell the sell function gives you more tokens.
            // THIS IS NOT A MATH MISSTAKE THIS IS BECAUSE OF IMPRECISION STOP BULLYING ME. (could
            // be a math error but ssssshhuuuuuushhhh)
            N.ceil().try_into().unwrap()
        }

        fn sell(self: @ContractState, market_cap: u256, tokens: u256) -> u256 {
            let a = self.a.read();
            let sell = FixedTrait::new_unscaled(tokens, false);
            let mcap = FixedTrait::new_unscaled(market_cap, false);
            // You guessed it it's the inverse calculus of the buy function. You can do the maths
            // yourself it should work. If not then too bad.
            let exp_a_mcap = (mcap * a).exp().floor();
            let strk = ((sell * exp_a_mcap / self.precomputed_a.read()) + FixedTrait::ONE()).ln()
                / a;
            // Floor otherwise when you buy and then sell the sell function gives you more tokens.
            // THIS IS NOT A MATH MISSTAKE THIS IS BECAUSE OF IMPRECISION STOP BULLYING ME. (could
            // be a math error but ssssshhuuuuuushhhh)
            strk.floor().try_into().unwrap()
        }
    }
}
