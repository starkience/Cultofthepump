import { createTamagui } from '@tamagui/core'
import { configWithoutAnimations } from 'ui/src/theme/config'

const {
  // lets have our own settings
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  settings,
  ...defaultConfig
} = configWithoutAnimations

export const config = createTamagui({
  ...defaultConfig,
  settings: {
    // leaving out allowedStyleValues - we want looser string values for most
    // styles (so you can use "1rem", "calc(...)" and other CSS goodies):
    autocompleteSpecificTokens: 'except-special',
  },
})

type Conf = typeof config

declare module '@tamagui/core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface TamaguiCustomConfig extends Conf {}

  interface TypeOverride {
    groupNames(): 'active' | 'inactive' | 'disabled'
  }
}

export default config
