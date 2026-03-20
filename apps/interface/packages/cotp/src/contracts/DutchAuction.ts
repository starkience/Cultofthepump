export default {
  abi: [
    {
      type: "impl",
      name: "DutchAuctionImpl",
      interface_name: "contracts::interfaces::dutch_auction::IDutchAuction"
    },
    {
      type: "struct",
      name: "core::integer::u256",
      members: [
        {
          name: "low",
          type: "core::integer::u128"
        },
        {
          name: "high",
          type: "core::integer::u128"
        }
      ]
    },
    {
      type: "enum",
      name: "core::option::Option::<core::integer::u256>",
      variants: [
        {
          name: "Some",
          type: "core::integer::u256"
        },
        {
          name: "None",
          type: "()"
        }
      ]
    },
    {
      type: "struct",
      name: "core::byte_array::ByteArray",
      members: [
        {
          name: "data",
          type: "core::array::Array::<core::bytes_31::bytes31>"
        },
        {
          name: "pending_word",
          type: "core::felt252"
        },
        {
          name: "pending_word_len",
          type: "core::integer::u32"
        }
      ]
    },
    {
      type: "interface",
      name: "contracts::interfaces::dutch_auction::IDutchAuction",
      items: [
        {
          type: "function",
          name: "duration",
          inputs: [],
          outputs: [
            {
              type: "core::integer::u64"
            }
          ],
          state_mutability: "view"
        },
        {
          type: "function",
          name: "current_auction_start",
          inputs: [],
          outputs: [
            {
              type: "core::integer::u64"
            }
          ],
          state_mutability: "view"
        },
        {
          type: "function",
          name: "current_price",
          inputs: [],
          outputs: [
            {
              type: "core::option::Option::<core::integer::u256>"
            }
          ],
          state_mutability: "view"
        },
        {
          type: "function",
          name: "current_auction_bounds",
          inputs: [],
          outputs: [
            {
              type: "(core::integer::u256, core::integer::u256)"
            }
          ],
          state_mutability: "view"
        },
        {
          type: "function",
          name: "current_auction_bid",
          inputs: [],
          outputs: [
            {
              type: "core::integer::u256"
            }
          ],
          state_mutability: "view"
        },
        {
          type: "function",
          name: "bid",
          inputs: [
            {
              name: "name",
              type: "core::byte_array::ByteArray"
            },
            {
              name: "symbol",
              type: "core::byte_array::ByteArray"
            }
          ],
          outputs: [
            {
              type: "core::starknet::contract_address::ContractAddress"
            }
          ],
          state_mutability: "external"
        }
      ]
    },
    {
      type: "impl",
      name: "DutchAuctionSettersImpl",
      interface_name: "contracts::interfaces::dutch_auction::IDutchAuctionSetters"
    },
    {
      type: "struct",
      name: "contracts::interfaces::factory::IFactoryDispatcher",
      members: [
        {
          name: "contract_address",
          type: "core::starknet::contract_address::ContractAddress"
        }
      ]
    },
    {
      type: "struct",
      name: "openzeppelin_token::erc20::interface::IERC20Dispatcher",
      members: [
        {
          name: "contract_address",
          type: "core::starknet::contract_address::ContractAddress"
        }
      ]
    },
    {
      type: "interface",
      name: "contracts::interfaces::dutch_auction::IDutchAuctionSetters",
      items: [
        {
          type: "function",
          name: "set_end_price",
          inputs: [
            {
              name: "new_end_price",
              type: "core::integer::u256"
            }
          ],
          outputs: [],
          state_mutability: "external"
        },
        {
          type: "function",
          name: "set_duration",
          inputs: [
            {
              name: "new_duration",
              type: "core::integer::u64"
            }
          ],
          outputs: [],
          state_mutability: "external"
        },
        {
          type: "function",
          name: "set_treasury",
          inputs: [
            {
              name: "new_treasury",
              type: "core::starknet::contract_address::ContractAddress"
            }
          ],
          outputs: [],
          state_mutability: "external"
        },
        {
          type: "function",
          name: "set_factory",
          inputs: [
            {
              name: "new_factory",
              type: "contracts::interfaces::factory::IFactoryDispatcher"
            }
          ],
          outputs: [],
          state_mutability: "external"
        },
        {
          type: "function",
          name: "set_strk",
          inputs: [
            {
              name: "new_strk",
              type: "openzeppelin_token::erc20::interface::IERC20Dispatcher"
            }
          ],
          outputs: [],
          state_mutability: "external"
        }
      ]
    },
    {
      type: "impl",
      name: "UpgradeableImpl",
      interface_name: "openzeppelin_upgrades::interface::IUpgradeable"
    },
    {
      type: "interface",
      name: "openzeppelin_upgrades::interface::IUpgradeable",
      items: [
        {
          type: "function",
          name: "upgrade",
          inputs: [
            {
              name: "new_class_hash",
              type: "core::starknet::class_hash::ClassHash"
            }
          ],
          outputs: [],
          state_mutability: "external"
        }
      ]
    },
    {
      type: "impl",
      name: "OwnableImpl",
      interface_name: "openzeppelin_access::ownable::interface::IOwnable"
    },
    {
      type: "interface",
      name: "openzeppelin_access::ownable::interface::IOwnable",
      items: [
        {
          type: "function",
          name: "owner",
          inputs: [],
          outputs: [
            {
              type: "core::starknet::contract_address::ContractAddress"
            }
          ],
          state_mutability: "view"
        },
        {
          type: "function",
          name: "transfer_ownership",
          inputs: [
            {
              name: "new_owner",
              type: "core::starknet::contract_address::ContractAddress"
            }
          ],
          outputs: [],
          state_mutability: "external"
        },
        {
          type: "function",
          name: "renounce_ownership",
          inputs: [],
          outputs: [],
          state_mutability: "external"
        }
      ]
    },
    {
      type: "constructor",
      name: "constructor",
      inputs: [
        {
          name: "end_price",
          type: "core::integer::u256"
        },
        {
          name: "duration",
          type: "core::integer::u64"
        },
        {
          name: "strk",
          type: "openzeppelin_token::erc20::interface::IERC20Dispatcher"
        },
        {
          name: "factory",
          type: "contracts::interfaces::factory::IFactoryDispatcher"
        },
        {
          name: "treasury",
          type: "core::starknet::contract_address::ContractAddress"
        },
        {
          name: "owner",
          type: "core::starknet::contract_address::ContractAddress"
        }
      ]
    },
    {
      type: "event",
      name: "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferred",
      kind: "struct",
      members: [
        {
          name: "previous_owner",
          type: "core::starknet::contract_address::ContractAddress",
          kind: "key"
        },
        {
          name: "new_owner",
          type: "core::starknet::contract_address::ContractAddress",
          kind: "key"
        }
      ]
    },
    {
      type: "event",
      name: "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferStarted",
      kind: "struct",
      members: [
        {
          name: "previous_owner",
          type: "core::starknet::contract_address::ContractAddress",
          kind: "key"
        },
        {
          name: "new_owner",
          type: "core::starknet::contract_address::ContractAddress",
          kind: "key"
        }
      ]
    },
    {
      type: "event",
      name: "openzeppelin_access::ownable::ownable::OwnableComponent::Event",
      kind: "enum",
      variants: [
        {
          name: "OwnershipTransferred",
          type: "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferred",
          kind: "nested"
        },
        {
          name: "OwnershipTransferStarted",
          type: "openzeppelin_access::ownable::ownable::OwnableComponent::OwnershipTransferStarted",
          kind: "nested"
        }
      ]
    },
    {
      type: "event",
      name: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Upgraded",
      kind: "struct",
      members: [
        {
          name: "class_hash",
          type: "core::starknet::class_hash::ClassHash",
          kind: "data"
        }
      ]
    },
    {
      type: "event",
      name: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Event",
      kind: "enum",
      variants: [
        {
          name: "Upgraded",
          type: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Upgraded",
          kind: "nested"
        }
      ]
    },
    {
      type: "event",
      name: "contracts::dutch_auction::DutchAuction::AuctionCreated",
      kind: "struct",
      members: [
        {
          name: "start_time",
          type: "core::integer::u64",
          kind: "data"
        },
        {
          name: "start_price",
          type: "core::integer::u256",
          kind: "data"
        },
        {
          name: "end_price",
          type: "core::integer::u256",
          kind: "data"
        },
        {
          name: "duration",
          type: "core::integer::u64",
          kind: "data"
        }
      ]
    },
    {
      type: "event",
      name: "contracts::dutch_auction::DutchAuction::AuctionBid",
      kind: "struct",
      members: [
        {
          name: "bidder",
          type: "core::starknet::contract_address::ContractAddress",
          kind: "data"
        },
        {
          name: "price",
          type: "core::integer::u256",
          kind: "data"
        },
        {
          name: "token_address",
          type: "core::starknet::contract_address::ContractAddress",
          kind: "data"
        }
      ]
    },
    {
      type: "event",
      name: "contracts::dutch_auction::DutchAuction::ConfigUpdated",
      kind: "struct",
      members: [
        {
          name: "parameter",
          type: "core::byte_array::ByteArray",
          kind: "data"
        },
        {
          name: "value",
          type: "core::felt252",
          kind: "data"
        }
      ]
    },
    {
      type: "event",
      name: "contracts::dutch_auction::DutchAuction::Event",
      kind: "enum",
      variants: [
        {
          name: "OwnableEvent",
          type: "openzeppelin_access::ownable::ownable::OwnableComponent::Event",
          kind: "flat"
        },
        {
          name: "UpgradeableEvent",
          type: "openzeppelin_upgrades::upgradeable::UpgradeableComponent::Event",
          kind: "flat"
        },
        {
          name: "AuctionCreated",
          type: "contracts::dutch_auction::DutchAuction::AuctionCreated",
          kind: "nested"
        },
        {
          name: "AuctionBid",
          type: "contracts::dutch_auction::DutchAuction::AuctionBid",
          kind: "nested"
        },
        {
          name: "ConfigUpdated",
          type: "contracts::dutch_auction::DutchAuction::ConfigUpdated",
          kind: "nested"
        }
      ]
    }
  ]
} as const
