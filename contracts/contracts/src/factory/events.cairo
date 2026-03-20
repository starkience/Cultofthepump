use starknet::{ContractAddress, ClassHash};
/// Emitted when a new shitcoin is launched
#[derive(Drop, starknet::Event, Debug)]
pub struct ShitcoinLaunched {
    /// The address of the newly deployed shitcoin contract
    pub shitcoin_address: ContractAddress,
    /// The address of the user who created this shitcoin
    pub creator: ContractAddress,
    /// The name of the shitcoin
    pub name: ByteArray,
    /// The symbol/ticker of the shitcoin
    pub symbol: ByteArray,
    /// The initial price of the shitcoin in STRK
    pub initial_shniping: u256,
    /// The initial supply of the shitcoin
    pub pile_of_shit: u256,
}

/// Emitted when factory settings are configured
#[derive(Drop, starknet::Event, Debug)]
pub struct FactoryConfigured {
    /// The class hash used to deploy new shitcoin contracts
    pub shitcoin_class_hash: ClassHash,
    /// The address of the swap contract used for trading
    pub swap: ContractAddress,
    /// The address of the STRK token contract
    pub strk: ContractAddress,
    /// The address where fees are sent
    pub treasury: ContractAddress,
}

/// Add new event for configuration updates
#[derive(Drop, starknet::Event, Debug)]
pub struct ConfigUpdated {
    pub parameter: ByteArray,
    pub value: felt252,
}
