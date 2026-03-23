const BondingCurve = {
  abi: [
    {
      type: 'interface',
      name: 'cult_of_the_pump::bonding_curve::BondingPrice',
      items: [
        {
          type: 'function',
          name: 'buy',
          inputs: [
            { name: 'market_cap', type: 'core::integer::u256' },
            { name: 'buy', type: 'core::integer::u256' },
          ],
          outputs: [{ type: 'core::integer::u256' }],
          state_mutability: 'view',
        },
        {
          type: 'function',
          name: 'sell',
          inputs: [
            { name: 'market_cap', type: 'core::integer::u256' },
            { name: 'tokens', type: 'core::integer::u256' },
          ],
          outputs: [{ type: 'core::integer::u256' }],
          state_mutability: 'view',
        },
      ],
    },
    {
      type: 'struct',
      name: 'core::integer::u256',
      members: [
        { name: 'low', type: 'core::integer::u128' },
        { name: 'high', type: 'core::integer::u128' },
      ],
    },
  ],
} as const

export default BondingCurve
