export default {
  abi: [
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
      type: "struct",
      name: "openzeppelin_interfaces::erc20::IERC20Dispatcher",
      members: [
        {
          name: "contract_address",
          type: "core::starknet::contract_address::ContractAddress"
        }
      ]
    },
    {
      type: "impl",
      name: "Tradeable",
      interface_name: "contracts::swap::interface::Trade"
    },
    {
      type: "interface",
      name: "contracts::swap::interface::Trade",
      items: [
        {
          type: "function",
          name: "buy",
          inputs: [
            {
              name: "strk",
              type: "core::integer::u256"
            },
            {
              name: "token",
              type: "openzeppelin_interfaces::erc20::IERC20Dispatcher"
            }
          ],
          outputs: [
            {
              type: "core::integer::u256"
            }
          ],
          state_mutability: "external"
        },
        {
          type: "function",
          name: "sell",
          inputs: [
            {
              name: "amount",
              type: "core::integer::u256"
            },
            {
              name: "token",
              type: "openzeppelin_interfaces::erc20::IERC20Dispatcher"
            }
          ],
          outputs: [
            {
              type: "core::integer::u256"
            }
          ],
          state_mutability: "external"
        }
      ]
    }
  ]
} as const
