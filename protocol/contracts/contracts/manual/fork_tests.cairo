use contracts::swap::{TradeDispatcher, SwapSettersDispatcher, SwapSettersDispatcherTrait};
use contracts::factory::{ShinterfaceDispatcher, ShinterfaceDispatcherTrait};
use ekubo::interfaces::core::{ICoreDispatcher, ICoreDispatcherTrait};
use ekubo::types::keys::PoolKey;
use openzeppelin_interfaces::erc20::{IERC20Dispatcher, IERC20DispatcherTrait};
use snforge_std::{declare, ContractClassTrait, cheat_caller_address, CheatSpan, DeclareResultTrait};
use starknet::{ContractAddress, contract_address_const};
use super::bonding_curve::deploy_bonding_curve;

// Real mainnet contract addresses
const EKUBO_CORE: felt252 = 0x00000005dd3D2F4429AF886cD1a3b08289DBcEa99A294197E9eB43b0e0325b4b;
const STRK_TOKEN: felt252 = 0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d;
const EKUBO_REGISTRY: felt252 = 0x064bdb4094881140bc39340146c5fcc5a187a98aec5a53f448ac702e5de5067e;
const EKUBO_POSITIONS: felt252 = 0x02e0af29598b407c8716b17f6d2795eca1b471413fa03fb145a5e33722184067;
// Real user with STRK tokens on mainnet
const WHALE_ADDRESS: felt252 = 0x03efcc03349e110de18937ec2bff72e0bb9c8d545ccfdf6befb428f9aebcdcdf;

#[test]
#[fork("mainnet")]
fn test_strk_token_integration() {
    // Get STRK token dispatcher
    let strk = IERC20Dispatcher { contract_address: STRK_TOKEN.try_into().unwrap() };

    // Deploy our contracts
    let (factory, _) = setup_contracts(strk);

    // Test launching a token with real STRK
    let TOKEN_NAME: ByteArray = "Test Token";
    let TOKEN_SYMBOL: ByteArray = "TEST";
    let INITIAL_AMOUNT: u256 = 1000 * STRK_OFFSET;
    let FEES: u256 = 100 * STRK_OFFSET;

    // Impersonate whale address for STRK approval
    cheat_caller_address(
        strk.contract_address, WHALE_ADDRESS.try_into().unwrap(), CheatSpan::TargetCalls(1),
    );
    strk.approve(factory.contract_address, INITIAL_AMOUNT + FEES);

    // Launch token as whale
    cheat_caller_address(
        factory.contract_address,
        contract_address_const::<WHALE_ADDRESS>(),
        CheatSpan::TargetCalls(1),
    );
    let token_address = factory
        .launshitcoin(
            contract_address_const::<WHALE_ADDRESS>(),
            TOKEN_NAME,
            TOKEN_SYMBOL,
            INITIAL_AMOUNT.try_into().unwrap(),
        );
    // Verify token was created and has correct balance
    let token = IERC20Dispatcher { contract_address: token_address };
    let balance = token.balance_of(WHALE_ADDRESS.try_into().unwrap());
    assert!(balance > 0, "Token balance should be greater than 0");
}

#[test]
#[fork("mainnet")]
fn test_ekubo_integration() {
    // Get Ekubo core dispatcher
    let ekubo = ICoreDispatcher { contract_address: EKUBO_CORE.try_into().unwrap() };

    // Deploy our contracts
    let strk = IERC20Dispatcher { contract_address: STRK_TOKEN.try_into().unwrap() };
    let (factory, _) = setup_contracts(strk);

    // Launch a token with enough STRK to trigger Ekubo pool creation
    let TOKEN_NAME: ByteArray = "Pool Token";
    let TOKEN_SYMBOL: ByteArray = "POOL";
    let INITIAL_AMOUNT: u256 = 150_000 * STRK_OFFSET;
    let FEES: u256 = 100 * STRK_OFFSET;

    // Mock approval and launch as whale
    cheat_caller_address(
        strk.contract_address, WHALE_ADDRESS.try_into().unwrap(), CheatSpan::TargetCalls(1),
    );
    strk.approve(factory.contract_address, INITIAL_AMOUNT + FEES);

    cheat_caller_address(
        factory.contract_address, WHALE_ADDRESS.try_into().unwrap(), CheatSpan::TargetCalls(1),
    );
    let token_address = factory
        .launshitcoin(
            contract_address_const::<WHALE_ADDRESS>(),
            TOKEN_NAME,
            TOKEN_SYMBOL,
            INITIAL_AMOUNT.try_into().unwrap(),
        );

    // Create pool key for verification
    let (token0, token1) = if Into::<
        felt252, u256,
        >::into(token_address.into()) < Into::<
        felt252, u256,
    >::into(strk.contract_address.into()) {
        (token_address, strk.contract_address)
    } else {
        (strk.contract_address, token_address)
    };

    let pool_key = PoolKey {
        token0,
        token1,
        fee: 0x28f5c28f5c28f600000000000000000, // 1%
        tick_spacing: 5982,
        extension: contract_address_const::<0>(),
    };

    // Verify pool was created on Ekubo
    let pool_exists = ekubo.get_pool_liquidity(pool_key) > 0;
    assert!(pool_exists, "Ekubo pool should exist");
}

// Helper functions
fn USER1() -> ContractAddress {
    WHALE_ADDRESS.try_into().unwrap()
}

const STRK_OFFSET: u256 = 1_000_000_000_000_000_000;

fn setup_contracts(strk: IERC20Dispatcher) -> (ShinterfaceDispatcher, TradeDispatcher) {
    // Deploy bonding curve
    let bonding_curve = deploy_bonding_curve();

    // Deploy swap with owner and factory set to USER2()
    let mut constructor_calldata = array![];
    strk.serialize(ref constructor_calldata);
    bonding_curve.serialize(ref constructor_calldata);
    USER2().serialize(ref constructor_calldata); // treasury
    TryInto::<felt252, ContractAddress>::try_into(EKUBO_CORE)
        .unwrap()
        .serialize(ref constructor_calldata); // ekubo_core
    // Mock addresses for Ekubo registry and positions contracts
    contract_address_const::<EKUBO_REGISTRY>()
        .serialize(ref constructor_calldata); // ekubo_registry
    contract_address_const::<EKUBO_POSITIONS>()
        .serialize(ref constructor_calldata); // ekubo_positions
    USER2().serialize(ref constructor_calldata); // owner
    USER2().serialize(ref constructor_calldata); // factory

    let swap_contract = declare("swap").unwrap().contract_class();
    let (swap_address, _) = swap_contract
        .deploy(@constructor_calldata)
        .expect('failed to deploy swap');
    let swap = TradeDispatcher { contract_address: swap_address };

    // Deploy factory
    let shitcoin_class_hash = *declare("erc20").unwrap().contract_class().class_hash;
    let mut constructor_calldata = array![];
    shitcoin_class_hash.serialize(ref constructor_calldata);
    swap.serialize(ref constructor_calldata);
    strk.serialize(ref constructor_calldata);
    USER2().serialize(ref constructor_calldata); // treasury
    USER2().serialize(ref constructor_calldata); // owner

    let factory_contract = declare("factory").unwrap().contract_class();
    let (factory_address, _) = factory_contract
        .deploy(@constructor_calldata)
        .expect('failed to deploy factory');
    let factory = ShinterfaceDispatcher { contract_address: factory_address };

    // Set factory as authorized price setter in swap
    cheat_caller_address(swap_address, USER2(), CheatSpan::TargetCalls(1));
    let swap_setters = SwapSettersDispatcher { contract_address: swap_address };
    swap_setters.set_factory(factory_address);

    (factory, swap)
}

fn USER2() -> ContractAddress {
    contract_address_const::<0xbeef>()
}
