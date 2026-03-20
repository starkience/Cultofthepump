use starknet::ContractAddress;
#[derive(Drop, starknet::Event)]
pub struct AuctionCreated {
    pub start_time: u64,
    pub start_price: u256,
    pub end_price: u256,
    pub duration: u64,
}

#[derive(Drop, starknet::Event)]
pub struct AuctionBid {
    pub bidder: ContractAddress,
    pub price: u256,
    pub sniping: u256,
    pub token_address: ContractAddress,
}

#[derive(Drop, starknet::Event)]
pub struct ConfigUpdated {
    pub parameter: ByteArray,
    pub value: felt252,
}
