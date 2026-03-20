use starknet::ContractAddress;
/// Emitted when tokens are bought with STRK
#[derive(Drop, starknet::Event, Debug)]
pub struct TokenBought {
    #[key]
    pub token: ContractAddress,
    pub buyer: ContractAddress,
    pub strk_amount: u256,
    pub token_amount: u256,
    pub market_cap: u256,
    pub fees: u256,
}

/// Emitted when tokens are sold for STRK
#[derive(Drop, starknet::Event, Debug)]
pub struct TokenSold {
    #[key]
    pub token: ContractAddress,
    pub seller: ContractAddress,
    pub token_amount: u256,
    pub strk_amount: u256,
    pub market_cap: u256,
    pub fees: u256,
}

/// Emitted when a token is launched on Ekubo DEX
#[derive(Drop, starknet::Event, Debug)]
pub struct PoolLaunched {
    pub token: ContractAddress,
    pub token0: ContractAddress,
    pub token1: ContractAddress,
    pub tick_spacing: u128,
    pub fee: u128,
}

/// Emitted when configuration is updated
#[derive(Drop, starknet::Event)]
pub struct ConfigUpdated {
    pub parameter: ByteArray,
    pub value: felt252,
}

