use contracts::dutch_auction::{
    BidDispatcher, BidDispatcherTrait, DutchAuctionSettersDispatcher,
    DutchAuctionSettersDispatcherTrait, dutch_auction::Event, AuctionCreated, AuctionBid,
    ConfigUpdated,
};
use openzeppelin_interfaces::erc20::{IERC20Dispatcher, IERC20DispatcherTrait};
use contracts::factory::{ShinterfaceDispatcher, ShinterfaceDispatcherTrait};
use contracts::swap::{SwapSettersDispatcher, SwapSettersDispatcherTrait};
use snforge_std::{
    declare, ContractClassTrait, DeclareResultTrait, spy_events, EventSpyAssertionsTrait,
    cheat_caller_address, start_cheat_block_timestamp_global, CheatSpan,
};
use starknet::{contract_address_const, ContractAddress};
use super::bonding_curve::deploy_bonding_curve;
use super::swap::{deploy_swap, deploy_erc20};
use super::factory::deploy_factory;
fn USER1() -> ContractAddress {
    contract_address_const::<0xdead>()
}
fn USER2() -> ContractAddress {
    contract_address_const::<0xbeef>()
}
fn SUPPLY() -> u256 {
    1_000_000_000 * STRK_OFFSET
}
fn START_PRICE() -> u256 {
    1_000 * STRK_OFFSET
}
fn END_PRICE() -> u256 {
    10 * STRK_OFFSET
}
const STRK_OFFSET: u256 = 1_000_000_000_000_000_000;

pub fn deploy_dutch_auction(
    start_price: u256,
    end_price: u256,
    start_timestamp: u64,
    duration: u64,
    strk: IERC20Dispatcher,
    factory: ShinterfaceDispatcher,
    owner: ContractAddress,
    treasury: ContractAddress,
) -> BidDispatcher {
    let contract = declare("dutch_auction").unwrap().contract_class();
    let mut constructor_calldata = array![];
    start_price.serialize(ref constructor_calldata);
    end_price.serialize(ref constructor_calldata);
    start_timestamp.serialize(ref constructor_calldata);
    duration.serialize(ref constructor_calldata);
    strk.serialize(ref constructor_calldata);
    factory.serialize(ref constructor_calldata);
    owner.serialize(ref constructor_calldata);
    treasury.serialize(ref constructor_calldata);

    let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();

    BidDispatcher { contract_address }
}

fn setup_contracts() -> (IERC20Dispatcher, ContractAddress, BidDispatcher) {
    let bonding_curve = deploy_bonding_curve();
    let strk = IERC20Dispatcher {
        contract_address: deploy_erc20("Stark", "strk", SUPPLY(), USER2(), USER2()),
    };

    // Deploy swap with owner and factory set to USER2
    let swap = deploy_swap(strk.contract_address, bonding_curve, USER2());

    let shitcoin_class_hash = *declare("erc20").unwrap().contract_class().class_hash;
    let factory = deploy_factory(shitcoin_class_hash, swap, strk, USER2(), USER2());

    // Set factory as authorized price setter in swap
    cheat_caller_address(swap.contract_address, USER2(), CheatSpan::TargetCalls(1));
    let swap_setters = SwapSettersDispatcher { contract_address: swap.contract_address };
    swap_setters.set_factory(factory.contract_address);

    let dutch_auction = deploy_dutch_auction(
        START_PRICE(), END_PRICE(), 0, 990, strk, factory, USER2(), USER2(),
    );
    cheat_caller_address(factory.contract_address, USER2(), CheatSpan::TargetCalls(1));
    factory.set_dutch_auction(dutch_auction.contract_address);

    (strk, factory.contract_address, dutch_auction)
}

#[test]
fn test_simple_auction() {
    let expected_auction_price = 555 * STRK_OFFSET;
    let (strk, _, dutch_auction) = setup_contracts();
    let mut spy = spy_events();

    cheat_caller_address(strk.contract_address, USER2(), CheatSpan::TargetCalls(1));
    strk.transfer(USER1(), expected_auction_price);

    start_cheat_block_timestamp_global(445);
    cheat_caller_address(strk.contract_address, USER1(), CheatSpan::TargetCalls(1));
    strk.approve(dutch_auction.contract_address, expected_auction_price);

    cheat_caller_address(dutch_auction.contract_address, USER1(), CheatSpan::TargetCalls(1));
    let melon = dutch_auction.bid("Melon", "Musk", 0);

    spy
        .assert_emitted(
            @array![
                (
                    dutch_auction.contract_address,
                    Event::AuctionBid(
                        AuctionBid {
                            bidder: USER1(),
                            price: expected_auction_price,
                            sniping: 0,
                            token_address: melon,
                        },
                    ),
                ),
                (
                    dutch_auction.contract_address,
                    Event::AuctionCreated(
                        AuctionCreated {
                            start_time: 990,
                            start_price: expected_auction_price * 2,
                            end_price: END_PRICE(),
                            duration: 990,
                        },
                    ),
                ),
            ],
        );
}

#[test]
fn test_auction_expired_create_new_and_bid() {
    let expected_auction_price = END_PRICE();
    let (strk, _, dutch_auction) = setup_contracts();
    let mut spy = spy_events();
    cheat_caller_address(strk.contract_address, USER2(), CheatSpan::TargetCalls(1));
    strk.transfer(USER1(), expected_auction_price);
    start_cheat_block_timestamp_global(1000);
    cheat_caller_address(strk.contract_address, USER1(), CheatSpan::TargetCalls(1));
    strk.approve(dutch_auction.contract_address, expected_auction_price);
    cheat_caller_address(dutch_auction.contract_address, USER1(), CheatSpan::TargetCalls(2));
    dutch_auction.create_auction(1000, 0);

    spy
        .assert_emitted(
            @array![
                (
                    dutch_auction.contract_address,
                    Event::AuctionCreated(
                        AuctionCreated {
                            start_time: 1000,
                            start_price: END_PRICE(),
                            end_price: END_PRICE(),
                            duration: 990,
                        },
                    ),
                ),
            ],
        );

    start_cheat_block_timestamp_global(1500);
    let melon = dutch_auction.bid("Melon", "Musk", 0);

    spy
        .assert_emitted(
            @array![
                (
                    dutch_auction.contract_address,
                    Event::AuctionBid(
                        AuctionBid {
                            bidder: USER1(),
                            price: expected_auction_price,
                            sniping: 0,
                            token_address: melon,
                        },
                    ),
                ),
                (
                    dutch_auction.contract_address,
                    Event::AuctionCreated(
                        AuctionCreated {
                            start_time: 1990,
                            start_price: 2 * END_PRICE(),
                            end_price: END_PRICE(),
                            duration: 990,
                        },
                    ),
                ),
            ],
        );
}

#[test]
#[should_panic(expected: "Auction expired")]
fn test_auction_expired_bid_fail() {
    let expected_auction_price = END_PRICE();
    let (strk, _, dutch_auction) = setup_contracts();
    cheat_caller_address(strk.contract_address, USER2(), CheatSpan::TargetCalls(1));
    strk.transfer(USER1(), expected_auction_price);
    start_cheat_block_timestamp_global(1000);
    cheat_caller_address(strk.contract_address, USER1(), CheatSpan::TargetCalls(1));
    strk.approve(dutch_auction.contract_address, expected_auction_price);
    cheat_caller_address(dutch_auction.contract_address, USER1(), CheatSpan::TargetCalls(2));
    let _ = dutch_auction.bid("Melon", "Musk", 0);
}

#[test]
#[should_panic(expected: "Auction not started")]
fn test_auction_not_started_bid_fail() {
    let expected_auction_price = END_PRICE();
    let (strk, _, dutch_auction) = setup_contracts();
    cheat_caller_address(strk.contract_address, USER2(), CheatSpan::TargetCalls(1));
    strk.transfer(USER1(), expected_auction_price);
    start_cheat_block_timestamp_global(1000);
    cheat_caller_address(strk.contract_address, USER1(), CheatSpan::TargetCalls(1));
    strk.approve(dutch_auction.contract_address, expected_auction_price);
    cheat_caller_address(dutch_auction.contract_address, USER1(), CheatSpan::TargetCalls(2));
    dutch_auction.create_auction(2500, 0);
    start_cheat_block_timestamp_global(1001);
    let _ = dutch_auction.bid("Melon", "Musk", 0);
}

#[test]
#[should_panic(expected: "Auction not started")]
fn test_auction_creates_new_auction() {
    let expected_auction_price = 555 * STRK_OFFSET;
    let (strk, _, dutch_auction) = setup_contracts();
    cheat_caller_address(strk.contract_address, USER2(), CheatSpan::TargetCalls(1));
    strk.transfer(USER1(), expected_auction_price);
    start_cheat_block_timestamp_global(445);
    cheat_caller_address(strk.contract_address, USER1(), CheatSpan::TargetCalls(1));
    strk.approve(dutch_auction.contract_address, expected_auction_price);
    cheat_caller_address(dutch_auction.contract_address, USER1(), CheatSpan::TargetCalls(1));
    let _ = dutch_auction.bid("Melon", "Musk", 0);
    let _ = dutch_auction.bid("Melon", "Musk", 0);
}

#[test]
fn test_setters() {
    let (_, _, dutch_auction) = setup_contracts();
    let setters = DutchAuctionSettersDispatcher {
        contract_address: dutch_auction.contract_address,
    };

    let new_end_price = 20 * STRK_OFFSET;
    let new_duration = 1200_u64;
    let new_treasury = contract_address_const::<0x888>();
    let new_strk = IERC20Dispatcher { contract_address: contract_address_const::<0x777>() };
    let new_factory = ShinterfaceDispatcher { contract_address: contract_address_const::<0x999>() };

    let mut spy = spy_events();
    cheat_caller_address(dutch_auction.contract_address, USER2(), CheatSpan::TargetCalls(5));

    setters.set_end_price(new_end_price);
    setters.set_duration(new_duration);
    setters.set_treasury(new_treasury);
    setters.set_strk(new_strk);
    setters.set_factory(new_factory);

    // Verify events were emitted
    spy
        .assert_emitted(
            @array![
                (
                    dutch_auction.contract_address,
                    Event::ConfigUpdated(
                        ConfigUpdated {
                            parameter: "end_price", value: new_end_price.try_into().unwrap(),
                        },
                    ),
                ),
                (
                    dutch_auction.contract_address,
                    Event::ConfigUpdated(
                        ConfigUpdated { parameter: "duration", value: new_duration.into() },
                    ),
                ),
                (
                    dutch_auction.contract_address,
                    Event::ConfigUpdated(
                        ConfigUpdated { parameter: "treasury", value: new_treasury.into() },
                    ),
                ),
                (
                    dutch_auction.contract_address,
                    Event::ConfigUpdated(
                        ConfigUpdated {
                            parameter: "strk", value: new_strk.contract_address.into(),
                        },
                    ),
                ),
                (
                    dutch_auction.contract_address,
                    Event::ConfigUpdated(
                        ConfigUpdated {
                            parameter: "factory", value: new_factory.contract_address.into(),
                        },
                    ),
                ),
            ],
        );
}

#[test]
#[should_panic(expected: ('Caller is not the owner',))]
fn test_setters_unauthorized() {
    let (_, _, dutch_auction) = setup_contracts();
    let setters = DutchAuctionSettersDispatcher {
        contract_address: dutch_auction.contract_address,
    };

    // Should fail when called by non-owner
    cheat_caller_address(dutch_auction.contract_address, USER1(), CheatSpan::TargetCalls(1));
    setters.set_duration(1200);
}
