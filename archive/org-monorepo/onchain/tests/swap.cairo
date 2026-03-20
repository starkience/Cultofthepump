use onchain::swap::{
    TradeDispatcher, TradeDispatcherTrait, SwapSettersDispatcher, SwapSettersDispatcherTrait,
};
use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, cheat_caller_address, CheatSpan};
use starknet::{contract_address_const, ContractAddress};


fn USER1() -> ContractAddress {
    contract_address_const::<0xdead>()
}
fn USER2() -> ContractAddress {
    contract_address_const::<0xbeef>()
}
const SUPPLY: u256 = 1_000_000_000;

fn deploy_bonding_curve() -> ContractAddress {
    let contract = declare("bonding_curve").unwrap().contract_class();
    let (contract_address, _) = contract
        .deploy(@array![702083079445386, 0, 5626256942481413242880, 0])
        .expect('failed to deploy bonding curve');
    contract_address
}

fn deploy_swap(
    strk: ContractAddress, bonding_curve: ContractAddress, treasury: ContractAddress,
) -> TradeDispatcher {
    let mut constructor_calldata = array![];
    strk.serialize(ref constructor_calldata);
    bonding_curve.serialize(ref constructor_calldata);
    treasury.serialize(ref constructor_calldata);
    let contract = declare("swap").unwrap().contract_class();
    let (contract_address, _) = contract
        .deploy(@constructor_calldata)
        .expect('failed to deploy bonding curve');
    TradeDispatcher { contract_address }
}

fn deploy_erc20(
    name: ByteArray,
    symbol: ByteArray,
    supply: u256,
    recipient: ContractAddress,
    owner: ContractAddress,
) -> ContractAddress {
    let contract = declare("ERC20Upgradeable").unwrap().contract_class();
    let mut constructor_calldata = array![];
    name.serialize(ref constructor_calldata);
    symbol.serialize(ref constructor_calldata);
    supply.serialize(ref constructor_calldata);
    recipient.serialize(ref constructor_calldata);
    owner.serialize(ref constructor_calldata);

    let (contract_address, _) = contract
        .deploy(@constructor_calldata)
        .expect('failed to deploy erc20');
    contract_address
}

fn setup_contracts() -> (IERC20Dispatcher, IERC20Dispatcher, TradeDispatcher) {
    let bonding_curve = deploy_bonding_curve();
    let strk = deploy_erc20("Stark", "strk", SUPPLY, USER2(), USER2());
    let swap = deploy_swap(strk, bonding_curve, USER2());
    let melon = deploy_erc20("Melon Musk", "MUSK", SUPPLY, swap.contract_address, USER2());
    // Set the strk price to 0.50$ * 1000
    SwapSettersDispatcher { contract_address: swap.contract_address }.set_strk_price(melon, 50);
    (
        IERC20Dispatcher { contract_address: strk },
        IERC20Dispatcher { contract_address: melon },
        swap,
    )
}

#[test]
fn test_simple_buy_then_sell() {
    let (strk, melon, swap) = setup_contracts();
    // Give strk to user
    cheat_caller_address(strk.contract_address, USER2(), CheatSpan::TargetCalls(1));
    strk.transfer(USER1(), 2_000);

    // Approve swap contract to buy
    cheat_caller_address(strk.contract_address, USER1(), CheatSpan::TargetCalls(1));
    strk.approve(swap.contract_address, 2_000);

    // Check initial balances
    let initial_melon_balance = melon.balance_of(USER1());
    assert_eq!(initial_melon_balance, 0, "initial melon balance should be 0");
    let initial_strk_balance = strk.balance_of(USER1());
    assert_eq!(initial_strk_balance, 2_000, "initial strk balance should be 2_000");

    // Buy
    cheat_caller_address(swap.contract_address, USER1(), CheatSpan::TargetCalls(2));
    swap.buy(2_000, melon);

    // Check after buy balances
    let end_melon_balance = melon.balance_of(USER1());
    assert_eq!(end_melon_balance, 31_855_106, "wrong melon end balance");
    let end_strk_balance = strk.balance_of(USER1());
    assert_eq!(end_strk_balance, 0, "wrong strk end balance");

    // Approve swap contract to sell
    cheat_caller_address(melon.contract_address, USER1(), CheatSpan::TargetCalls(1));
    melon.approve(swap.contract_address, 31_855_106);
    swap.sell(31_855_106, melon);

    // Check end balances
    let after_swap_melon_balance = melon.balance_of(USER1());
    assert_eq!(after_swap_melon_balance, 0, "afterswap melon balance should be 0");
    let after_swap_strk_balance = strk.balance_of(USER1());
    assert_eq!(after_swap_strk_balance, 1959, "afterswap strk balance should be 1959");
}

#[test]
fn test_big_buy_then_sell() {
    let (strk, melon, swap) = setup_contracts();
    // Give strk to user
    cheat_caller_address(strk.contract_address, USER2(), CheatSpan::TargetCalls(1));
    strk.transfer(USER1(), 140_000);

    // Approve swap contract to buy
    cheat_caller_address(strk.contract_address, USER1(), CheatSpan::TargetCalls(1));
    strk.approve(swap.contract_address, 140_000);

    // Check initial balances
    let initial_melon_balance = melon.balance_of(USER1());
    assert_eq!(initial_melon_balance, 0, "initial melon balance should be 0");
    let initial_strk_balance = strk.balance_of(USER1());
    assert_eq!(initial_strk_balance, 140_000, "initial strk balance should be 140_000");

    // Buy
    cheat_caller_address(swap.contract_address, USER1(), CheatSpan::TargetCalls(2));
    swap.buy(140_000, melon);

    // Check after buy balances
    let end_melon_balance = melon.balance_of(USER1());
    assert_eq!(end_melon_balance, 799_827_927, "wrong melon end balance");
    let end_strk_balance = strk.balance_of(USER1());
    assert_eq!(end_strk_balance, 0, "wrong strk end balance");

    // Approve swap contract to sell
    cheat_caller_address(melon.contract_address, USER1(), CheatSpan::TargetCalls(1));
    melon.approve(swap.contract_address, 799_827_927);
    swap.sell(799_827_927, melon);

    // Check end balances
    let after_swap_melon_balance = melon.balance_of(USER1());
    assert_eq!(after_swap_melon_balance, 0, "afterswap melon balance should be 0");
    let after_swap_strk_balance = strk.balance_of(USER1());
    assert_eq!(after_swap_strk_balance, 137_214, "afterswap strk balance should be 1959");
}
