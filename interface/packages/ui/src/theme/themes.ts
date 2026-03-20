// Tamagui syntax for defining sub-themes

import { colorsDark } from 'ui/src/theme/color/colors'
import { opacify, opacifyRaw } from 'ui/src/theme/color/utils'

// this is just a helper for things that want to accept theme names as props
export type ThemeNames = 'primary' | 'secondary' | 'tertiary'

// TODO: systematize hover and focus states. requires consolidating mobile and web design systems (they have different button styles right now)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hoverColor = (color: any): string => opacify(90, color)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pressedColor = (color: any): string => opacify(85, color)

// remove $none from theme because it causes issues where $none tokens always resolve to transparent color
// even if they are technically a gap or other space/size property
// tamagui could make this so that themes only apply to color based properties, but would need a release
const { none: darkTransparent, ...tamaguiColorsDark } = colorsDark

const dark = {
  ...tamaguiColorsDark,
  transparent: darkTransparent,
  background: colorsDark.surface1,
  backgroundHover: colorsDark.surface2,
  backgroundPress: colorsDark.surface2,
  backgroundFocus: colorsDark.surface2,
  borderColor: opacifyRaw(50, colorsDark.neutral2),
  borderColorHover: opacifyRaw(80, colorsDark.neutral2),
  borderColorFocus: colorsDark.neutral2,
  outlineColor: colorsDark.none,
  color: colorsDark.neutral1,
  colorHover: colorsDark.accent1,
  colorPress: colorsDark.accent1,
  colorFocus: colorsDark.accent1,
  shadowColor: 'rgba(0,0,0,0.4)',
  shadowColorHover: 'rgba(0,0,0,0.5)',
}

type BaseTheme = typeof dark

const dark_branded: BaseTheme = {
  ...dark,
  color: colorsDark.accent1,
}

const dark_primary: BaseTheme = dark

const dark_secondary: BaseTheme = {
  ...dark,
  color: colorsDark.neutral2,
}

// Button
// primary
// theme: dark
const dark_primary_Button: BaseTheme = {
  ...dark,
  background: colorsDark.accent1Gradiant,
  backgroundHover: hoverColor(colorsDark.accent1),
  backgroundPress: pressedColor(colorsDark.accent1),
  color: colorsDark.surface1,
  borderColor: colorsDark.none,
}

// secondary
// theme: dark
const dark_secondary_Button: BaseTheme = {
  ...dark,
  background: colorsDark.neutral1,
  backgroundHover: hoverColor(colorsDark.neutral1),
  backgroundPress: pressedColor(colorsDark.neutral1),
  color: colorsDark.surface1,
  borderColor: colorsDark.none,
}

// tertiary
// theme: dark
const dark_tertiary_Button: BaseTheme = {
  ...dark,
  background: colorsDark.none,
  backgroundHover: colorsDark.none,
  backgroundPress: colorsDark.none,
  color: colorsDark.neutral1,
  borderColorHover: colorsDark.neutral1,
}

// combine and narrow theme types before exporting
const allThemes = {
  dark,
  dark_branded,
  dark_primary,
  dark_secondary,
  dark_primary_Button,
  dark_secondary_Button,
  dark_tertiary_Button,
}

type ThemeName = keyof typeof allThemes
type Themes = {
  [key in ThemeName]: BaseTheme
}

export const themes: Themes = allThemes
