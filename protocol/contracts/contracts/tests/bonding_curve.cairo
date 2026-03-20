use cubit::f256::FixedTrait;
use contracts::bonding_curve::{
    BondingPriceDispatcher, BondingPriceDispatcherTrait, BondingCurveInitialized,
};
use snforge_std::{
    declare, ContractClassTrait, DeclareResultTrait, spy_events, EventSpyAssertionsTrait,
};
use starknet::ContractAddress;

const STRK_OFFSET: u256 = 1000000000000000000;

pub fn deploy_bonding_curve() -> ContractAddress {
    let contract = declare("bonding_curve").unwrap().contract_class();
    let mut constructor_calldata = array![];
    let A = FixedTrait::new(14019835472160854, false); // 4.81410060133 * 10**-23 * 2 ** 128
    let K = FixedTrait::new(102084710076281539039012382229530463436800, false); // 300  * 2 ** 128
    A.serialize(ref constructor_calldata);
    K.serialize(ref constructor_calldata);

    let mut spy = spy_events();
    let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();

    spy
        .assert_emitted(
            @array![
                (
                    contract_address,
                    contracts::bonding_curve::bonding_curve::Event::BondingCurveInitialized(
                        BondingCurveInitialized { a: A, k: K },
                    ),
                ),
            ],
        );

    contract_address
}

#[test]
fn test_small_buy_small_market_cap() {
    let contract_address = deploy_bonding_curve();
    let dispatcher = BondingPriceDispatcher { contract_address };
    let tokens = dispatcher.buy(0, 1000 * STRK_OFFSET);
    assert_eq!(tokens, 32_655_990_885_611_048_340_303_607);
}

#[test]
fn test_small_sell_small_market_cap() {
    let contract_address = deploy_bonding_curve();
    let dispatcher = BondingPriceDispatcher { contract_address };
    let strk = dispatcher.sell(1000 * STRK_OFFSET, 32_170_791 * STRK_OFFSET);
    assert_eq!(strk, 946_428_682_555_290_595_694);
}

#[test]
fn test_large_buy_small_market_cap() {
    let contract_address = deploy_bonding_curve();
    let dispatcher = BondingPriceDispatcher { contract_address };
    let tokens = dispatcher.buy(0, 101010 * STRK_OFFSET);
    let diff = tokens / (800_000_000 * STRK_OFFSET / 100);
    assert!(diff >= 99 && diff <= 101);
}

#[test]
fn test_large_sell_large_market_cap() {
    let contract_address = deploy_bonding_curve();
    let dispatcher = BondingPriceDispatcher { contract_address };
    let strk = dispatcher.sell(101010 * STRK_OFFSET, 800_000_000 * STRK_OFFSET);
    let diff = strk / (101010 * STRK_OFFSET / 100);
    assert!(diff >= 99 && diff <= 101);
}

#[test]
fn test_zero_buy() {
    let contract_address = deploy_bonding_curve();
    let dispatcher = BondingPriceDispatcher { contract_address };
    let tokens = dispatcher.buy(1000 * STRK_OFFSET, 0);
    assert_eq!(tokens, 0);
}

#[test]
fn test_zero_sell() {
    let contract_address = deploy_bonding_curve();
    let dispatcher = BondingPriceDispatcher { contract_address };
    let dollars = dispatcher.sell(1000 * STRK_OFFSET, 0);
    assert_eq!(dollars, 0);
}

#[test]
fn test_buy_sell_symmetry() {
    let contract_address = deploy_bonding_curve();
    let dispatcher = BondingPriceDispatcher { contract_address };

    // Buy tokens
    let market_cap = 100_000 * STRK_OFFSET;
    let buy_amount = 50_000 * STRK_OFFSET;
    let tokens = dispatcher.buy(market_cap, buy_amount);

    // Sell same amount of tokens
    let strk = dispatcher.sell(market_cap + buy_amount, tokens);

    // Should get back almost the same amount (small rounding differences)
    let difference = if buy_amount > strk {
        buy_amount * 100 / strk
    } else {
        strk * 100 / buy_amount
    };
    assert!(difference <= 101, "Buy/sell difference too large");
}
