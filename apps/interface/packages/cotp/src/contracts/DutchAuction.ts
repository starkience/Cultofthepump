export default {
  abi: [
    { type: "struct", name: "core::integer::u256", members: [{ name: "low", type: "core::integer::u128" }, { name: "high", type: "core::integer::u128" }] },
    { type: "struct", name: "core::byte_array::ByteArray", members: [{ name: "data", type: "core::array::Array::<core::bytes_31::bytes31>" }, { name: "pending_word", type: "core::felt252" }, { name: "pending_word_len", type: "core::integer::u32" }] },
    { type: "struct", name: "contracts::interfaces::factory::IFactoryDispatcher", members: [{ name: "contract_address", type: "core::starknet::contract_address::ContractAddress" }] },
    { type: "struct", name: "openzeppelin_token::erc20::interface::IERC20Dispatcher", members: [{ name: "contract_address", type: "core::starknet::contract_address::ContractAddress" }] },
    {
      type: "impl",
      name: "Bimpl",
      interface_name: "contracts::dutch_auction::interface::Bid"
    },
    {
      type: "interface",
      name: "contracts::dutch_auction::interface::Bid",
      items: [
        {
          type: "function",
          name: "create_auction",
          inputs: [
            { name: "start_time", type: "core::integer::u64" },
            { name: "start_price", type: "core::integer::u256" }
          ],
          outputs: [],
          state_mutability: "external"
        },
        {
          type: "function",
          name: "current_price",
          inputs: [],
          outputs: [{ type: "core::integer::u256" }],
          state_mutability: "view"
        },
        {
          type: "function",
          name: "bid",
          inputs: [
            { name: "name", type: "core::byte_array::ByteArray" },
            { name: "symbol", type: "core::byte_array::ByteArray" },
            { name: "sniping", type: "core::integer::u256" }
          ],
          outputs: [{ type: "core::starknet::contract_address::ContractAddress" }],
          state_mutability: "external"
        }
      ]
    },
    {
      type: "function",
      name: "start_timestamp",
      inputs: [],
      outputs: [{ type: "core::integer::u64" }],
      state_mutability: "view"
    },
    {
      type: "function",
      name: "duration",
      inputs: [],
      outputs: [{ type: "core::integer::u64" }],
      state_mutability: "view"
    },
    {
      type: "function",
      name: "start_price",
      inputs: [],
      outputs: [{ type: "core::integer::u256" }],
      state_mutability: "view"
    },
    {
      type: "function",
      name: "end_price",
      inputs: [],
      outputs: [{ type: "core::integer::u256" }],
      state_mutability: "view"
    },
    {
      type: "impl",
      name: "DutchAuctionSettersImpl",
      interface_name: "contracts::dutch_auction::interface::DutchAuctionSetters"
    },
    {
      type: "interface",
      name: "contracts::dutch_auction::interface::DutchAuctionSetters",
      items: [
        { type: "function", name: "set_end_price", inputs: [{ name: "new_end_price", type: "core::integer::u256" }], outputs: [], state_mutability: "external" },
        { type: "function", name: "set_duration", inputs: [{ name: "new_duration", type: "core::integer::u64" }], outputs: [], state_mutability: "external" },
        { type: "function", name: "set_treasury", inputs: [{ name: "new_treasury", type: "core::starknet::contract_address::ContractAddress" }], outputs: [], state_mutability: "external" },
        { type: "function", name: "set_factory", inputs: [{ name: "new_factory", type: "contracts::interfaces::factory::IFactoryDispatcher" }], outputs: [], state_mutability: "external" },
        { type: "function", name: "set_strk", inputs: [{ name: "new_strk", type: "openzeppelin_token::erc20::interface::IERC20Dispatcher" }], outputs: [], state_mutability: "external" }
      ]
    }
  ]
} as const
