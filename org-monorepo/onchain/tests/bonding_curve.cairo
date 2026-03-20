use cubit::f128::Fixed;
use cubit::f128::FixedTrait;
use onchain::bonding_curve::BondingPriceDispatcher;
use onchain::bonding_curve::BondingPriceDispatcherTrait;
use snforge_std::{declare, ContractClassTrait, DeclareResultTrait};
use starknet::ContractAddress;

fn deploy_contract(name: ByteArray, a: Fixed, k: Fixed) -> ContractAddress {
    let contract = declare(name).unwrap().contract_class();
    let mut constructor_calldata = array![];
    a.serialize(ref constructor_calldata);
    k.serialize(ref constructor_calldata);
    let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();
    contract_address
}

#[test]
fn test_small_buy_small_market_cap() {
    let A = FixedTrait::new(702083079445386, false); // 0.00003806 * 2 ** 64
    let K = FixedTrait::new_unscaled(305, false); // 305 * 2 ** 64
    let contract_address = deploy_contract("bonding_curve", A, K);

    let dispatcher = BondingPriceDispatcher { contract_address };
    let tokens = dispatcher.buy(0, 1000);
    assert_eq!(tokens, 32_170_791);
}

#[test]
fn test_small_sell_small_market_cap() {
    let A = FixedTrait::new(702083079445386, false); // 0.00003806 * 2 ** 64
    let K = FixedTrait::new_unscaled(305, false); // 305 * 2 ** 64
    let contract_address = deploy_contract("bonding_curve", A, K);

    let dispatcher = BondingPriceDispatcher { contract_address };
    let dollars = dispatcher.sell(1000, 32_170_791);
    assert_eq!(dollars, 999);
}

#[test]
fn test_large_buy_small_market_cap() {
    // Test with a large buy amount compared to market cap
    let A = FixedTrait::new(702083079445386, false);
    let K = FixedTrait::new_unscaled(305, false);
    let contract_address = deploy_contract("bonding_curve", A, K);

    let dispatcher = BondingPriceDispatcher { contract_address };
    let tokens = dispatcher.buy(10, 70000);

    assert_eq!(tokens, 801_143_081);
}
#[test]
fn test_large_sell_large_market_cap() {
    // Test with a large sell amount compared to market cap
    let A = FixedTrait::new(702083079445386, false);
    let K = FixedTrait::new_unscaled(305, false);
    let contract_address = deploy_contract("bonding_curve", A, K);

    let dispatcher = BondingPriceDispatcher { contract_address };
    let dollars = dispatcher.sell(70010, 801_143_081);

    assert_eq!(dollars, 70000);
}
