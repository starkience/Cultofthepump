export default {
  abi: [
    { type: "struct", name: "core::integer::u256", members: [{ name: "low", type: "core::integer::u128" }, { name: "high", type: "core::integer::u128" }] },
    {
      type: "interface",
      name: "contracts::staking::ICultStaking",
      items: [
        {
          type: "function", name: "notify_reward",
          inputs: [
            { name: "token", type: "core::starknet::contract_address::ContractAddress" },
            { name: "strk_amount", type: "core::integer::u256" },
          ],
          outputs: [],
          state_mutability: "external",
        },
        {
          type: "function", name: "deposit_fees",
          inputs: [
            { name: "token", type: "core::starknet::contract_address::ContractAddress" },
            { name: "strk_amount", type: "core::integer::u256" },
          ],
          outputs: [],
          state_mutability: "external",
        },
        {
          type: "function", name: "stake",
          inputs: [
            { name: "token", type: "core::starknet::contract_address::ContractAddress" },
            { name: "amount", type: "core::integer::u256" },
          ],
          outputs: [],
          state_mutability: "external",
        },
        {
          type: "function", name: "unstake",
          inputs: [
            { name: "token", type: "core::starknet::contract_address::ContractAddress" },
            { name: "amount", type: "core::integer::u256" },
          ],
          outputs: [],
          state_mutability: "external",
        },
        {
          type: "function", name: "claim",
          inputs: [{ name: "token", type: "core::starknet::contract_address::ContractAddress" }],
          outputs: [{ type: "core::integer::u256" }],
          state_mutability: "external",
        },
        {
          type: "function", name: "stake_and_claim",
          inputs: [
            { name: "token", type: "core::starknet::contract_address::ContractAddress" },
            { name: "amount", type: "core::integer::u256" },
          ],
          outputs: [{ type: "core::integer::u256" }],
          state_mutability: "external",
        },
        {
          type: "function", name: "total_staked",
          inputs: [{ name: "token", type: "core::starknet::contract_address::ContractAddress" }],
          outputs: [{ type: "core::integer::u256" }],
          state_mutability: "view",
        },
        {
          type: "function", name: "staked_balance",
          inputs: [
            { name: "token", type: "core::starknet::contract_address::ContractAddress" },
            { name: "staker", type: "core::starknet::contract_address::ContractAddress" },
          ],
          outputs: [{ type: "core::integer::u256" }],
          state_mutability: "view",
        },
        {
          type: "function", name: "earned",
          inputs: [
            { name: "token", type: "core::starknet::contract_address::ContractAddress" },
            { name: "staker", type: "core::starknet::contract_address::ContractAddress" },
          ],
          outputs: [{ type: "core::integer::u256" }],
          state_mutability: "view",
        },
        {
          type: "function", name: "total_fees_deposited",
          inputs: [{ name: "token", type: "core::starknet::contract_address::ContractAddress" }],
          outputs: [{ type: "core::integer::u256" }],
          state_mutability: "view",
        },
        {
          type: "function", name: "swap_address",
          inputs: [],
          outputs: [{ type: "core::starknet::contract_address::ContractAddress" }],
          state_mutability: "view",
        },
      ],
    },
  ],
}
