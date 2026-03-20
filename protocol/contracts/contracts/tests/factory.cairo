use contracts::factory::{
    ShinterfaceDispatcher as Shitspatcher, ShinterfaceDispatcherTrait as ShitspatcherTrait,
    factory::Event, ShitcoinLaunched, ConfigUpdated,
};
use contracts::swap::{TradeDispatcher, SwapSettersDispatcher, SwapSettersDispatcherTrait};
use openzeppelin_interfaces::{
    erc20::{IERC20Dispatcher, IERC20DispatcherTrait},
    upgrades::{IUpgradeableDispatcher, IUpgradeableDispatcherTrait},
};
use openzeppelin_upgrades::UpgradeableComponent;
use snforge_std::{
    declare, ContractClassTrait, DeclareResultTrait, cheat_caller_address, CheatSpan, spy_events,
    load, EventSpyAssertionsTrait,
};
use starknet::{contract_address_const, ContractAddress, ClassHash};
use super::bonding_curve::deploy_bonding_curve;
use super::swap::{deploy_swap, deploy_erc20};

fn USER1() -> ContractAddress {
    contract_address_const::<0xdead>()
}
fn USER2() -> ContractAddress {
    contract_address_const::<0xbeef>()
}
fn SUPPLY() -> u256 {
    1_000_000_000 * STRK_OFFSET
}
const STRK_OFFSET: u256 = 1_000_000_000_000_000_000;

pub fn deploy_factory(
    shitcoin_class_hash: ClassHash,
    swap: TradeDispatcher,
    strk: IERC20Dispatcher,
    treasury: ContractAddress,
    owner: ContractAddress,
) -> Shitspatcher {
    let mut constructor_calldata = array![];
    shitcoin_class_hash.serialize(ref constructor_calldata);
    swap.serialize(ref constructor_calldata);
    strk.serialize(ref constructor_calldata);
    treasury.serialize(ref constructor_calldata);
    owner.serialize(ref constructor_calldata);

    let contract = declare("factory").unwrap().contract_class();
    let (contract_address, _) = contract
        .deploy(@constructor_calldata)
        .expect('failed to deploy factory');
    Shitspatcher { contract_address }
}

fn setup_contracts() -> (IERC20Dispatcher, Shitspatcher) {
    let bonding_curve = deploy_bonding_curve();
    let strk = IERC20Dispatcher {
        contract_address: deploy_erc20("Stark", "strk", SUPPLY(), USER2(), USER2()),
    };

    // Deploy swap with owner and factory set to USER2
    let swap = deploy_swap(strk.contract_address, bonding_curve, USER2());

    let shitcoin_class_hash = *declare("erc20").unwrap().contract_class().class_hash;
    let factory = deploy_factory(shitcoin_class_hash, swap, strk, USER2(), USER2());
    cheat_caller_address(factory.contract_address, USER2(), CheatSpan::TargetCalls(1));
    factory.set_dutch_auction(USER1());

    // Set factory as authorized price setter in swap
    cheat_caller_address(swap.contract_address, USER2(), CheatSpan::TargetCalls(1));
    let swap_setters = SwapSettersDispatcher { contract_address: swap.contract_address };
    swap_setters.set_factory(factory.contract_address);

    (strk, factory)
}

#[test]
fn test_simple_buy_then_sell() {
    let AMOUNT: u256 = 2_000 * STRK_OFFSET;
    let INITIAL_SHNIPING = 2000 * STRK_OFFSET.try_into().unwrap();
    let EXPECTED_PILE = 63379687491186058738824681;
    let TOKEN_NAME: ByteArray = "Melon musk";
    let TOKEN_SYMBOL: ByteArray = "MELON";

    let (strk, factory) = setup_contracts();

    // Give strk to user
    cheat_caller_address(strk.contract_address, USER2(), CheatSpan::TargetCalls(1));
    strk.transfer(USER1(), AMOUNT);

    // Approve swap contract to buy
    cheat_caller_address(strk.contract_address, USER1(), CheatSpan::TargetCalls(1));
    strk.approve(factory.contract_address, AMOUNT);

    // Check initial balances
    let initial_strk_balance = strk.balance_of(USER1());
    assert_eq!(initial_strk_balance, AMOUNT, "initial strk balance should be 2_100");

    // Launch and spy events
    let mut spy = spy_events();
    cheat_caller_address(factory.contract_address, USER1(), CheatSpan::TargetCalls(2));
    let melon = IERC20Dispatcher {
        contract_address: factory
            .launshitcoin(USER1(), TOKEN_NAME.clone(), TOKEN_SYMBOL.clone(), INITIAL_SHNIPING),
    };

    // Verify launch event
    spy
        .assert_emitted(
            @array![
                (
                    factory.contract_address,
                    Event::ShitcoinLaunched(
                        ShitcoinLaunched {
                            shitcoin_address: melon.contract_address,
                            creator: USER1(),
                            name: TOKEN_NAME.clone(),
                            symbol: TOKEN_SYMBOL.clone(),
                            pile_of_shit: EXPECTED_PILE,
                            initial_shniping: INITIAL_SHNIPING,
                        },
                    ),
                ),
            ],
        );

    // Check after buy balances
    let end_melon_balance = melon.balance_of(USER1());
    assert_eq!(end_melon_balance, EXPECTED_PILE.into(), "wrong melon end balance");
    let end_strk_balance = strk.balance_of(USER1());
    assert_eq!(end_strk_balance, 0, "wrong strk end balance");
}

#[test]
fn test_launch_with_zero_strk() {
    let TOKEN_NAME: ByteArray = "Zero Coin";
    let TOKEN_SYMBOL: ByteArray = "ZERO";
    let INITIAL_SHNIPING = 0;
    let EXPECTED_PILE = 0;

    let (_, factory) = setup_contracts();

    cheat_caller_address(factory.contract_address, USER1(), CheatSpan::TargetCalls(1));
    let mut spy = spy_events();

    // Launch with 0 STRK - should succeed
    let token = factory
        .launshitcoin(USER1(), TOKEN_NAME.clone(), TOKEN_SYMBOL.clone(), INITIAL_SHNIPING);

    // Verify launch event
    spy
        .assert_emitted(
            @array![
                (
                    factory.contract_address,
                    Event::ShitcoinLaunched(
                        ShitcoinLaunched {
                            shitcoin_address: token,
                            creator: USER1(),
                            name: TOKEN_NAME.clone(),
                            symbol: TOKEN_SYMBOL.clone(),
                            initial_shniping: INITIAL_SHNIPING,
                            pile_of_shit: EXPECTED_PILE,
                        },
                    ),
                ),
            ],
        );
}

#[test]
fn test_multiple_launches() {
    let TOKEN1_NAME: ByteArray = "Token1";
    let TOKEN1_SYMBOL: ByteArray = "TK1";
    let TOKEN1_INITIAL_SHNIPING = 1000 * STRK_OFFSET;
    let TOKEN1_EXPECTED_PILE = 32336046109180181088422357;

    let TOKEN2_NAME: ByteArray = "Token2";
    let TOKEN2_SYMBOL: ByteArray = "TK2";
    let TOKEN2_INITIAL_SHNIPING = 0;
    let TOKEN2_EXPECTED_PILE = 0;

    let (strk, factory) = setup_contracts();

    // Give STRK and approve for both launches
    cheat_caller_address(strk.contract_address, USER2(), CheatSpan::TargetCalls(1));
    strk.transfer(USER1(), TOKEN1_INITIAL_SHNIPING);
    cheat_caller_address(strk.contract_address, USER1(), CheatSpan::TargetCalls(1));
    strk.approve(factory.contract_address, TOKEN1_INITIAL_SHNIPING);

    let mut spy = spy_events();

    cheat_caller_address(factory.contract_address, USER1(), CheatSpan::TargetCalls(3));

    // Launch multiple tokens with different initial STRK amounts
    let token1 = factory
        .launshitcoin(
            USER1(),
            TOKEN1_NAME.clone(),
            TOKEN1_SYMBOL.clone(),
            TOKEN1_INITIAL_SHNIPING.try_into().unwrap(),
        );
    let token2 = factory
        .launshitcoin(USER1(), TOKEN2_NAME.clone(), TOKEN2_SYMBOL.clone(), TOKEN2_INITIAL_SHNIPING);

    // Verify events for both launches
    spy
        .assert_emitted(
            @array![
                (
                    factory.contract_address,
                    Event::ShitcoinLaunched(
                        ShitcoinLaunched {
                            shitcoin_address: token1,
                            creator: USER1(),
                            name: TOKEN1_NAME.clone(),
                            symbol: TOKEN1_SYMBOL.clone(),
                            initial_shniping: TOKEN1_INITIAL_SHNIPING.try_into().unwrap(),
                            pile_of_shit: TOKEN1_EXPECTED_PILE,
                        },
                    ),
                ),
                (
                    factory.contract_address,
                    Event::ShitcoinLaunched(
                        ShitcoinLaunched {
                            shitcoin_address: token2,
                            creator: USER1(),
                            name: TOKEN2_NAME,
                            symbol: TOKEN2_SYMBOL,
                            initial_shniping: TOKEN2_INITIAL_SHNIPING,
                            pile_of_shit: TOKEN2_EXPECTED_PILE,
                        },
                    ),
                ),
            ],
        );

    assert!(token1 != token2, "Tokens should have different addresses");
}

#[test]
fn test_setters() {
    let (_strk, factory) = setup_contracts();

    // Test setting new values
    let new_class_hash = *declare("erc20").unwrap().contract_class().class_hash;
    let new_swap = contract_address_const::<0x999>();
    let new_treasury = contract_address_const::<0x888>();

    // Set new values as treasury
    let mut spy = spy_events();
    cheat_caller_address(factory.contract_address, USER2(), CheatSpan::TargetCalls(5));

    factory.set_shitcoin_class_hash(new_class_hash);
    factory.set_swap(new_swap);
    factory.set_treasury(new_treasury);

    // Verify storage values directly
    let class_hash_storage = load(factory.contract_address, selector!("shitcoin_class_hash"), 1);
    assert_eq!(*class_hash_storage.at(0), new_class_hash.into(), "Wrong class hash in storage");

    let swap_storage = load(factory.contract_address, selector!("swap"), 1);
    assert_eq!(*swap_storage.at(0), new_swap.into(), "Wrong swap address in storage");

    let treasury_storage = load(factory.contract_address, selector!("treasury"), 1);
    assert_eq!(*treasury_storage.at(0), new_treasury.into(), "Wrong treasury address in storage");

    // Verify events were emitted
    spy
        .assert_emitted(
            @array![
                (
                    factory.contract_address,
                    Event::ConfigUpdated(
                        ConfigUpdated {
                            parameter: "shitcoin_class_hash", value: new_class_hash.into(),
                        },
                    ),
                ),
                (
                    factory.contract_address,
                    Event::ConfigUpdated(
                        ConfigUpdated { parameter: "swap", value: new_swap.into() },
                    ),
                ),
                (
                    factory.contract_address,
                    Event::ConfigUpdated(
                        ConfigUpdated { parameter: "treasury", value: new_treasury.into() },
                    ),
                ),
            ],
        );
}


#[test]
fn test_upgrade() {
    let (_, factory) = setup_contracts();

    // Mock new class hash
    let new_class_hash = *declare("factory").unwrap().contract_class().class_hash;

    // Should succeed when called by owner
    cheat_caller_address(factory.contract_address, USER2(), CheatSpan::TargetCalls(1));
    let mut spy = spy_events();

    IUpgradeableDispatcher { contract_address: factory.contract_address }.upgrade(new_class_hash);

    // Verify event was emitted
    spy
        .assert_emitted(
            @array![
                (
                    factory.contract_address,
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
    let (_, factory) = setup_contracts();

    // Mock new class hash
    let new_class_hash = *declare("factory").unwrap().contract_class().class_hash;

    // Should fail when called by non-owner
    cheat_caller_address(factory.contract_address, USER1(), CheatSpan::TargetCalls(1));
    IUpgradeableDispatcher { contract_address: factory.contract_address }.upgrade(new_class_hash);
}
