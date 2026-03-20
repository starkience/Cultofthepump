use contracts::bonding_curve::BondingPriceDispatcher;
use contracts::swap::{
    TradeDispatcher, TradeDispatcherTrait, SwapSettersDispatcher, SwapSettersDispatcherTrait,
    swap::Event, TokenBought, TokenSold, PoolLaunched, ConfigUpdated,
};
use ekubo::types::i129::i129;
use openzeppelin_interfaces::{
    erc20::{IERC20Dispatcher, IERC20DispatcherTrait},
    upgrades::{IUpgradeableDispatcher, IUpgradeableDispatcherTrait},
};
use openzeppelin_upgrades::UpgradeableComponent;
use snforge_std::{
    declare, ContractClassTrait, DeclareResultTrait, cheat_caller_address, CheatSpan, mock_call,
    spy_events, EventSpyAssertionsTrait, load,
};
use starknet::storage_access::StorePacking;
use starknet::{contract_address_const, ContractAddress};
use super::bonding_curve::deploy_bonding_curve;

fn USER1() -> ContractAddress {
    contract_address_const::<0xdead>()
}
fn USER2() -> ContractAddress {
    contract_address_const::<0xbeef>()
}
fn EKUBO_CORE() -> ContractAddress {
    contract_address_const::<0x1234>()
}

const SUPPLY: u256 = 1_000_000_000_000_000_000_000_000_000;
const STRK_OFFSET: u128 = 1_000_000_000_000_000_000;

pub fn deploy_swap(
    strk: ContractAddress, bonding_curve: ContractAddress, treasury: ContractAddress,
) -> TradeDispatcher {
    // Mock Ekubo contracts and calls
    let ekubo_registry = contract_address_const::<0x1235>();
    let ekubo_positions = contract_address_const::<0x1236>();

    // Mock Ekubo core contract call
    mock_call(EKUBO_CORE(), selector!("maybe_initialize_pool"), array![0], 10);
    // Mock registry call
    mock_call(ekubo_registry, selector!("register_token"), array![0], 10);
    // Mock positions calls
    mock_call(
        ekubo_positions, selector!("mint_and_deposit_and_clear_both"), array![1, 0, 0, 0, 0, 0], 10,
    );
    mock_call(ekubo_positions, selector!("unsafe_burn"), (), 10);

    let mut constructor_calldata = array![];
    strk.serialize(ref constructor_calldata);
    bonding_curve.serialize(ref constructor_calldata);
    treasury.serialize(ref constructor_calldata);
    EKUBO_CORE().serialize(ref constructor_calldata);
    ekubo_registry.serialize(ref constructor_calldata);
    ekubo_positions.serialize(ref constructor_calldata);
    USER2().serialize(ref constructor_calldata); // owner
    USER2().serialize(ref constructor_calldata); // factory

    let contract = declare("swap").unwrap().contract_class();
    let (contract_address, _) = contract
        .deploy(@constructor_calldata)
        .expect('failed to deploy swap');
    TradeDispatcher { contract_address }
}

pub fn deploy_erc20(
    name: ByteArray,
    symbol: ByteArray,
    supply: u256,
    recipient: ContractAddress,
    owner: ContractAddress,
) -> ContractAddress {
    let contract = declare("erc20").unwrap().contract_class();
    let mut constructor_calldata = array![];
    name.serialize(ref constructor_calldata);
    symbol.serialize(ref constructor_calldata);
    supply.serialize(ref constructor_calldata);
    recipient.serialize(ref constructor_calldata);

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
    cheat_caller_address(swap.contract_address, USER2(), CheatSpan::TargetCalls(1));

    (
        IERC20Dispatcher { contract_address: strk },
        IERC20Dispatcher { contract_address: melon },
        swap,
    )
}

#[test]
fn test_simple_buy_then_sell() {
    let (strk, melon, swap) = setup_contracts();
    let mut spy = spy_events();
    let strk_amount = 2_000 * STRK_OFFSET.into();
    let expected_melon_balance = 63379687491186058738824681;
    // Give strk to user
    cheat_caller_address(strk.contract_address, USER2(), CheatSpan::TargetCalls(1));
    strk.transfer(USER1(), strk_amount);

    // Approve swap contract to buy
    cheat_caller_address(strk.contract_address, USER1(), CheatSpan::TargetCalls(1));
    strk.approve(swap.contract_address, strk_amount);

    // Check initial balances
    let initial_melon_balance = melon.balance_of(USER1());
    assert_eq!(initial_melon_balance, 0, "initial melon balance should be 0");
    let initial_strk_balance = strk.balance_of(USER1());
    assert_eq!(initial_strk_balance, strk_amount, "initial strk balance should be 2_000");

    // Buy
    cheat_caller_address(swap.contract_address, USER1(), CheatSpan::TargetCalls(2));
    swap.buy(strk_amount, melon);

    // Check after buy balances
    let end_melon_balance = melon.balance_of(USER1());
    assert_eq!(end_melon_balance, expected_melon_balance, "wrong melon end balance");
    let end_strk_balance = strk.balance_of(USER1());
    assert_eq!(end_strk_balance, 0, "wrong strk end balance");

    // Approve swap contract to sell
    cheat_caller_address(melon.contract_address, USER1(), CheatSpan::TargetCalls(1));
    melon.approve(swap.contract_address, expected_melon_balance);
    swap.sell(expected_melon_balance.try_into().unwrap(), melon);

    // Check end balances
    let after_swap_melon_balance = melon.balance_of(USER1());
    assert_eq!(after_swap_melon_balance, 0, "afterswap melon balance should be 0");
    let after_swap_strk_balance = strk.balance_of(USER1());
    assert_eq!(after_swap_strk_balance, 1812283624956502471252);

    // Check events
    spy
        .assert_emitted(
            @array![
                (
                    swap.contract_address,
                    Event::TokenBought(
                        TokenBought {
                            token: melon.contract_address,
                            buyer: USER1(),
                            strk_amount: strk_amount.try_into().unwrap(),
                            token_amount: expected_melon_balance.try_into().unwrap(),
                            market_cap: 1980000000000000000000,
                            fees: strk_amount.try_into().unwrap() / 100,
                        },
                    ),
                ),
                (
                    swap.contract_address,
                    Event::TokenSold(
                        TokenSold {
                            token: melon.contract_address,
                            seller: USER1(),
                            token_amount: expected_melon_balance.try_into().unwrap(),
                            strk_amount: 1812283624956502471252,
                            market_cap: 167716375043497528748,
                            fees: 18305895201580833042,
                        },
                    ),
                ),
            ],
        );
}

#[test]
fn test_big_buy_then_sell() {
    let (strk, melon, swap) = setup_contracts();
    let strk_amount = 140_000 * STRK_OFFSET.into();
    let expected_token_amount = 799999999 * STRK_OFFSET.into();
    let mut spy = spy_events();

    // Give strk to user
    cheat_caller_address(strk.contract_address, USER2(), CheatSpan::TargetCalls(1));
    strk.transfer(USER1(), strk_amount);
    // Approve swap contract to buy
    cheat_caller_address(strk.contract_address, USER1(), CheatSpan::TargetCalls(1));
    strk.approve(swap.contract_address, strk_amount);

    // Check initial balances
    let initial_melon_balance = melon.balance_of(USER1());
    assert_eq!(initial_melon_balance, 0, "initial melon balance should be 0");
    let initial_strk_balance = strk.balance_of(USER1());
    assert_eq!(initial_strk_balance, strk_amount, "initial strk balance should be 140_000");

    // Buy
    cheat_caller_address(swap.contract_address, USER1(), CheatSpan::TargetCalls(2));
    swap.buy(strk_amount.try_into().unwrap(), melon);
    // Check after buy balances
    let end_melon_balance = melon.balance_of(USER1());
    assert_eq!(end_melon_balance, expected_token_amount, "wrong melon end balance");
    let end_strk_balance = strk.balance_of(USER1());
    assert_eq!(end_strk_balance, 0, "wrong strk end balance");

    // Approve swap contract to sell
    cheat_caller_address(melon.contract_address, USER1(), CheatSpan::TargetCalls(1));
    melon.approve(swap.contract_address, expected_token_amount);
    swap.sell(expected_token_amount.try_into().unwrap(), melon);

    // Check end balances
    let expected_strk_balance = 136945200345974241317421;
    let after_swap_melon_balance = melon.balance_of(USER1());
    assert_eq!(after_swap_melon_balance, 0, "afterswap melon balance should be 0");
    let after_swap_strk_balance = strk.balance_of(USER1());
    assert_eq!(
        after_swap_strk_balance,
        expected_strk_balance,
        "afterswap strk balance should be 136945200345974241317421",
    );

    // Check events
    spy
        .assert_emitted(
            @array![
                (
                    swap.contract_address,
                    Event::TokenBought(
                        TokenBought {
                            token: melon.contract_address,
                            buyer: USER1(),
                            strk_amount: strk_amount.try_into().unwrap(),
                            token_amount: expected_token_amount.try_into().unwrap(),
                            market_cap: 138600000000000000000000,
                            fees: strk_amount.try_into().unwrap() / 100,
                        },
                    ),
                ),
                (
                    swap.contract_address,
                    Event::TokenSold(
                        TokenSold {
                            token: melon.contract_address,
                            seller: USER1(),
                            token_amount: expected_token_amount.try_into().unwrap(),
                            strk_amount: expected_strk_balance.try_into().unwrap(),
                            market_cap: 1654799654025758682579,
                            fees: 1383284851979537791085,
                        },
                    ),
                ),
            ],
        );
}
#[test]
fn test_launch_pool() {
    let (strk, melon, swap) = setup_contracts();
    let mut spy = spy_events();
    let strk_amount = 111010 * STRK_OFFSET.into();
    // Buy enough tokens to trigger pool launch
    cheat_caller_address(strk.contract_address, USER2(), CheatSpan::TargetCalls(1));
    strk.transfer(USER1(), strk_amount);

    cheat_caller_address(strk.contract_address, USER1(), CheatSpan::TargetCalls(1));
    strk.approve(swap.contract_address, strk_amount);

    cheat_caller_address(swap.contract_address, USER1(), CheatSpan::TargetCalls(2));
    swap.buy(strk_amount.try_into().unwrap(), melon);
    let (token0, token1) = if Into::<
        felt252, u256,
        >::into(Into::<ContractAddress, felt252>::into(melon.contract_address)) < Into::<
        felt252, u256,
    >::into(Into::<ContractAddress, felt252>::into(strk.contract_address)) {
        (melon.contract_address, strk.contract_address)
    } else {
        (strk.contract_address, melon.contract_address)
    };

    // Check both TokenBought and PoolLaunched events were emitted
    spy
        .assert_emitted(
            @array![
                (
                    swap.contract_address,
                    Event::TokenBought(
                        TokenBought {
                            token: melon.contract_address,
                            buyer: USER1(),
                            strk_amount: strk_amount.try_into().unwrap(),
                            token_amount: 799999999000000000000000000,
                            market_cap: 109899900000000000000000,
                            fees: strk_amount.try_into().unwrap() / 100,
                        },
                    ),
                ),
                (
                    swap.contract_address,
                    Event::PoolLaunched(
                        PoolLaunched {
                            token: melon.contract_address,
                            token0,
                            token1,
                            tick_spacing: 5982,
                            fee: 0xc49ba5e353f7d00000000000000000,
                        },
                    ),
                ),
            ],
        );
}


#[test]
#[should_panic(expected: "All tokens are sold")]
fn test_buy_more_than_offering() {
    let (strk, melon, swap) = setup_contracts();
    let amount = 140_000 * STRK_OFFSET.into();
    // Give strk to user
    cheat_caller_address(strk.contract_address, USER2(), CheatSpan::TargetCalls(1));
    strk.transfer(USER1(), 3 * amount);

    // Approve swap contract to buy
    cheat_caller_address(strk.contract_address, USER1(), CheatSpan::TargetCalls(1));
    strk.approve(swap.contract_address, 3 * amount);

    // Check initial balances
    let initial_melon_balance = melon.balance_of(USER1());
    assert_eq!(initial_melon_balance, 0, "initial melon balance should be 0");
    let initial_strk_balance = strk.balance_of(USER1());
    assert_eq!(initial_strk_balance, 3 * amount, "initial strk balance should be 420_000");

    // Buy
    cheat_caller_address(swap.contract_address, USER1(), CheatSpan::TargetCalls(2));
    swap.buy(2 * amount.try_into().unwrap(), melon);
    swap.buy(amount.try_into().unwrap(), melon);
}

#[test]
#[should_panic(expected: "STRK amount cannot be 0")]
fn test_buy_zero_amount() {
    let (_strk, melon, swap) = setup_contracts();

    cheat_caller_address(swap.contract_address, USER1(), CheatSpan::TargetCalls(1));
    swap.buy(0, melon);
}


#[test]
#[should_panic(expected: "Amount cannot be 0")]
fn test_sell_zero_amount() {
    let (_strk, melon, swap) = setup_contracts();

    cheat_caller_address(swap.contract_address, USER1(), CheatSpan::TargetCalls(1));
    swap.sell(0, melon);
}

#[test]
fn test_setters() {
    let (_, _, swap) = setup_contracts();
    let swap_setters = SwapSettersDispatcher { contract_address: swap.contract_address };

    // Test setting new values
    let new_bonding_curve = deploy_bonding_curve();
    let new_treasury = contract_address_const::<0x888>();
    let new_tick = i129 { sign: true, mag: 10000 };
    let new_fees = 200_u128; // 2% fee
    let new_factory = contract_address_const::<0x777>();

    let mut spy = spy_events();
    cheat_caller_address(swap.contract_address, USER2(), CheatSpan::TargetCalls(5));

    swap_setters.set_bonding_curve(BondingPriceDispatcher { contract_address: new_bonding_curve });
    swap_setters.set_starting_tick(new_tick);
    swap_setters.set_treasury(new_treasury);
    swap_setters.set_fees(new_fees);
    swap_setters.set_factory(new_factory);

    // Verify storage values directly
    let bonding_curve_storage = load(swap.contract_address, selector!("bonding_curve"), 1);
    assert_eq!(
        *bonding_curve_storage.at(0), new_bonding_curve.into(), "Wrong bonding curve in storage",
    );

    let treasury_storage = load(swap.contract_address, selector!("treasury"), 1);
    assert_eq!(*treasury_storage.at(0), new_treasury.into(), "Wrong treasury in storage");

    let tick_storage = load(swap.contract_address, selector!("starting_tick"), 1);
    assert_eq!(
        StorePacking::<i129, felt252>::unpack(*tick_storage.at(0)),
        new_tick,
        "Wrong tick in storage",
    );

    let fees_storage = load(swap.contract_address, selector!("fees"), 1);
    assert_eq!(*fees_storage.at(0), new_fees.into(), "Wrong fees in storage");

    let factory_storage = load(swap.contract_address, selector!("factory"), 1);
    assert_eq!(*factory_storage.at(0), new_factory.into(), "Wrong factory in storage");

    // Verify events were emitted
    spy
        .assert_emitted(
            @array![
                (
                    swap.contract_address,
                    Event::ConfigUpdated(
                        ConfigUpdated {
                            parameter: "bonding_curve", value: new_bonding_curve.into(),
                        },
                    ),
                ),
                (
                    swap.contract_address,
                    Event::ConfigUpdated(
                        ConfigUpdated { parameter: "treasury", value: new_treasury.into() },
                    ),
                ),
                (
                    swap.contract_address,
                    Event::ConfigUpdated(
                        ConfigUpdated { parameter: "starting_tick", value: new_tick.mag.into() },
                    ),
                ),
                (
                    swap.contract_address,
                    Event::ConfigUpdated(
                        ConfigUpdated { parameter: "fees", value: new_fees.into() },
                    ),
                ),
                (
                    swap.contract_address,
                    Event::ConfigUpdated(
                        ConfigUpdated { parameter: "factory", value: new_factory.into() },
                    ),
                ),
            ],
        );
}


#[test]
#[should_panic(expected: ('Caller is not the owner',))]
fn test_setters_unauthorized() {
    let (_, _, swap) = setup_contracts();
    let swap_setters = SwapSettersDispatcher { contract_address: swap.contract_address };

    // Should fail when called by non-owner
    cheat_caller_address(swap.contract_address, USER1(), CheatSpan::TargetCalls(1));
    swap_setters.set_fees(200);
}
#[test]
fn test_upgrade() {
    let (_, _, swap) = setup_contracts();

    // Mock new class hash
    let new_class_hash = *declare("swap").unwrap().contract_class().class_hash;

    // Should succeed when called by owner
    cheat_caller_address(swap.contract_address, USER2(), CheatSpan::TargetCalls(1));
    let mut spy = spy_events();

    IUpgradeableDispatcher { contract_address: swap.contract_address }.upgrade(new_class_hash);

    // Verify event was emitted
    spy
        .assert_emitted(
            @array![
                (
                    swap.contract_address,
                    Event::UpgradeableEvent(
                        UpgradeableComponent::Event::Upgraded(
                            UpgradeableComponent::Upgraded { class_hash: new_class_hash },
                        ),
                    ),
                ),
            ],
        );
}

#[test]
#[should_panic(expected: ('Caller is not the owner',))]
fn test_upgrade_unauthorized() {
    let (_, _, swap) = setup_contracts();

    // Mock new class hash
    let new_class_hash = *declare("swap").unwrap().contract_class().class_hash;

    // Should fail when called by non-owner
    cheat_caller_address(swap.contract_address, USER1(), CheatSpan::TargetCalls(1));
    IUpgradeableDispatcher { contract_address: swap.contract_address }.upgrade(new_class_hash);
}
