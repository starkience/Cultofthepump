use sncast_std::{
    declare, deploy, invoke, call, DeclareResult, DeclareResultTrait, DeployResult, InvokeResult,
    CallResult, get_nonce, FeeSettings, EthFeeSettings, ScriptCommandError,
};
use cubit::f256::FixedTrait;
use starknet::{ContractAddress, ClassHash, class_hash::class_hash_const, contract_address_const};

const BONDING_CURVE_DECIMALS: u8 = 3;
const FACTORY_CREATE_FEE: u256 = 100_000_000_000_000_000_000_u256;
const MAX_FEE: felt252 = 999999999999999;
const SALT: felt252 = 3;

// Sepolia dependencies
const EKUBO_CORE_ADDRESS: felt252 =
    0x444a09d96389aa7148f1aada508e30b71299ffe650d9c97fdaae38cb9a23384;
const EKUBO_POSITIONS_ADDRESS: felt252 =
    0x6a2aee84bb0ed5dded4384ddd0e40e9c1372b818668375ab8e3ec08807417e5;
const EKUBO_REGISTRY_ADDRESS: felt252 =
    0x4484f91f0d2482bad844471ca8dc8e846d3a0211792322e72f21f0f44be63e5;
const EKUBO_ORACLE_ADDRESS: felt252 =
    0x03ccf3ee24638dd5f1a51ceb783e120695f53893f6fd947cc2dcabb3f86dc65;
const USDC_TOKEN_ADDRESS: felt252 =
    0x7ab0b8855a61f480b4423c46c32fa7c553f0aac3531bbddaa282d86244f7a23;
const STRK_TOKEN_ADDRESS: felt252 =
    0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d;

fn declare_contract(contract_name: ByteArray) -> ClassHash {
    let nonce = get_nonce('pending');

    match declare(
        contract_name.clone(),
        FeeSettings::Eth(EthFeeSettings { max_fee: Option::Some(MAX_FEE) }),
        Option::Some(nonce),
    ) {
        Result::Ok(res) => {
            let class_hash = *res.class_hash();
            println!("Contract `{contract_name}` declared at `{:?}`", class_hash);
            class_hash
        },
        Result::Err(err) => {
            println!("{:?}", err);
            panic!("Failed to declare `{contract_name}`");
            class_hash_const::<0>()
        },
    }
}

fn deploy_contract(
    contract_name: ByteArray, class_hash: ClassHash, constructor_calldata: Array<felt252>,
) -> ContractAddress {
    let nonce = get_nonce('pending');

    match deploy(
        class_hash,
        constructor_calldata,
        Option::Some(SALT),
        true,
        FeeSettings::Eth(EthFeeSettings { max_fee: Option::Some(MAX_FEE) }),
        Option::Some(nonce),
    ) {
        Result::Ok(res) => {
            assert(res.transaction_hash != 0, 'tx hash is zero');
            println!("Contract `{contract_name}` deployed at `{:?}`", res.contract_address);
            res.contract_address
        },
        Result::Err(err) => {
            println!("{:?}", err);
            panic!("Failed to deploy `{contract_name}`");
            contract_address_const::<0>()
        },
    }
}

fn deploy_bonding_curve() -> ContractAddress {
    let class_hash = declare_contract("bonding_curve");

    let mut constructor_calldata = array![];
    // A = 4.81410060133 * 10**-23 * 2 ** 128
    let A = FixedTrait::new(14019835472160854, false);
    // K = 300 * 2 ** 128
    let K = FixedTrait::new(102084710076281539039012382229530463436800, false);
    A.serialize(ref constructor_calldata);
    K.serialize(ref constructor_calldata);

    deploy_contract("bonding_curve", class_hash, constructor_calldata)
}

fn deploy_swap(bonding_curve: ContractAddress, treasury: ContractAddress) -> ContractAddress {
    let class_hash = declare_contract("swap");

    let mut constructor_calldata = array![];
    STRK_TOKEN_ADDRESS.serialize(ref constructor_calldata);
    bonding_curve.serialize(ref constructor_calldata);
    treasury.serialize(ref constructor_calldata);
    EKUBO_CORE_ADDRESS.serialize(ref constructor_calldata);
    EKUBO_REGISTRY_ADDRESS.serialize(ref constructor_calldata);
    EKUBO_POSITIONS_ADDRESS.serialize(ref constructor_calldata);
    treasury.serialize(ref constructor_calldata); // owner
    treasury.serialize(ref constructor_calldata); // factory initial value

    deploy_contract("swap", class_hash, constructor_calldata)
}

fn deploy_factory(
    swap: ContractAddress, treasury: ContractAddress, meme_class_hash: ClassHash,
) -> ContractAddress {
    let class_hash = declare_contract("factory");

    let mut constructor_calldata = array![];
    meme_class_hash.serialize(ref constructor_calldata);
    swap.serialize(ref constructor_calldata);
    STRK_TOKEN_ADDRESS.serialize(ref constructor_calldata);
    treasury.serialize(ref constructor_calldata);
    treasury.serialize(ref constructor_calldata); // owner

    deploy_contract("factory", class_hash, constructor_calldata)
}

fn deploy_dutch_auction(factory: ContractAddress, treasury: ContractAddress) -> ContractAddress {
    let class_hash = declare_contract("dutch_auction");

    let mut constructor_calldata = array![];
    let start_price = 1000_000_000_000_000_000_000_u256; // 1000 STRK
    let end_price = 10_000_000_000_000_000_000_u256; // 10 STRK
    let start_timestamp = 0_u64;
    let duration = 990_u64;

    start_price.serialize(ref constructor_calldata);
    end_price.serialize(ref constructor_calldata);
    start_timestamp.serialize(ref constructor_calldata);
    duration.serialize(ref constructor_calldata);
    STRK_TOKEN_ADDRESS.serialize(ref constructor_calldata);
    factory.serialize(ref constructor_calldata);
    treasury.serialize(ref constructor_calldata);
    treasury.serialize(ref constructor_calldata); // owner

    deploy_contract("dutch_auction", class_hash, constructor_calldata)
}


fn set_dutch_auction_on_factory(
    factory_address: ContractAddress, dutch_auction_address: ContractAddress,
) {
    let nonce = get_nonce('pending');
    match invoke(
        factory_address,
        selector!("set_dutch_auction"),
        array![dutch_auction_address.into()],
        FeeSettings::Eth(EthFeeSettings { max_fee: Option::Some(MAX_FEE) }),
        Option::Some(nonce),
    ) {
        Result::Ok(_) => {
            println!(
                "Set dutch auction {:x} on factory {:x}", dutch_auction_address, factory_address,
            );
        },
        Result::Err(err) => {
            println!("{:?}", err);
            panic!("Failed to set dutch auction on factory");
        },
    }
}

fn main() {
    let bonding_curve_address = deploy_bonding_curve();
    let treasury_address = contract_address_const::<
        0x16d6ecec4b02597d56a8ef23b5f1ff3457839dece634def9d7dd6e857ada86c,
    >(); // todo: get sncast account (how?)
    let swap_address = deploy_swap(bonding_curve_address, treasury_address);
    let meme_class_hash = declare_contract("erc20");
    let factory_address = deploy_factory(swap_address, treasury_address, meme_class_hash);
    let dutch_auction_address = deploy_dutch_auction(factory_address, treasury_address);

    // Configure contract relationships
    set_dutch_auction_on_factory(factory_address, dutch_auction_address);

    println!("Deployment and configuration complete!");
}
