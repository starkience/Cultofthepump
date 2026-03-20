use starknet::{ClassHash, ContractAddress};

#[starknet::interface]
pub trait Shinterface<TContractState> {
    fn launshitcoin(
        ref self: TContractState,
        user: ContractAddress,
        shit_name: ByteArray,
        shit_symbol: ByteArray,
        initial_shniping: u256,
    ) -> ContractAddress;

    fn set_shitcoin_class_hash(ref self: TContractState, new_class_hash: ClassHash);
    fn set_swap(ref self: TContractState, new_swap: ContractAddress);
    fn set_treasury(ref self: TContractState, new_treasury: ContractAddress);
    fn set_dutch_auction(ref self: TContractState, new_dutch_auction: ContractAddress);
}
