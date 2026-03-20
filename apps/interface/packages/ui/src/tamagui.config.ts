import { createTamagui } from 'tamagui'
import { configWithoutAnimations } from 'ui/src/theme/config'

export type { TamaguiGroupNames } from 'ui/src/theme/config'

export const config = createTamagui({
  ...configWithoutAnimations,
})

export default config
