// until the web app needs all of tamagui, avoid heavy imports there
// eslint-disable-next-line no-restricted-imports
import { createFont, isAndroid, isWeb } from '@tamagui/core'
import { needsSmallFont } from 'ui/src/utils/needs-small-font'

const adjustedSize = (fontSize: number): number => {
  if (needsSmallFont()) {
    return fontSize
  }
  return fontSize + 1
}

// Note that React Native is a bit weird with fonts
// on iOS you must refer to them by the family name in the file
// on Android you must refer to them by the name of the file
// on web, it's the full family name in the file
const fontFamilyByPlatform = {
  android: {
    regular: 'JetBrains-Mono-Regular',
    medium: 'JetBrains-Mono-Medium',
    bold: 'JetBrains-Mono-Bold',
  },
  ios: {
    regular: 'JetBrains Mono Regular',
    medium: 'JetBrains Mono Medium',
    bold: 'JetBrains Mono Bold',
  },
  web: {
    regular: 'JetBrains Mono Regular',
    medium: 'JetBrains Mono Medium',
    bold: 'JetBrains Mono Bold',
  },
}

const platform = isWeb ? 'web' : isAndroid ? 'android' : 'ios'

const fontFamily = {
  serif: 'serif',
  sansSerif: {
    // iOS uses the name embedded in the font
    regular: fontFamilyByPlatform[platform].regular,
    medium: fontFamilyByPlatform[platform].medium,
    bold: fontFamilyByPlatform[platform].bold,
  },
}

const jetBrainsRegular = isWeb ? 'JetBrains Mono, monospace, sans-serif' : fontFamily.sansSerif.regular

const jetBrainsMedium = isWeb ? 'JetBrains Mono, monospace, sans-serif' : fontFamily.sansSerif.bold

const jetBrainsBold = isWeb ? 'JetBrains Mono, monospace, sans-serif' : fontFamily.sansSerif.bold

type SansSerifFontFamilyKey = keyof typeof fontFamily.sansSerif
type SansSerifFontFamilyValue = (typeof fontFamily.sansSerif)[SansSerifFontFamilyKey]

const platformFontFamily = (family: SansSerifFontFamilyKey): SansSerifFontFamilyKey | SansSerifFontFamilyValue => {
  if (isWeb) {
    return family
  }

  return fontFamily.sansSerif[family]
}

// default for non-button fonts
const REGULAR_WEIGHT = '400'

// used for buttons
const MEDIUM_WEIGHT = '500'

// used for titles
const BOLD_WEIGHT = '700'

const defaultWeights = {
  regular: REGULAR_WEIGHT,
  true: REGULAR_WEIGHT,
  medium: MEDIUM_WEIGHT,
  bold: BOLD_WEIGHT,
}

export const fonts = {
  heading1: {
    family: platformFontFamily('bold'),
    fontSize: adjustedSize(48),
    lineHeight: 52,
    fontWeight: BOLD_WEIGHT,
    maxFontSizeMultiplier: 1.2,
  },
  body1: {
    family: platformFontFamily('regular'),
    fontSize: adjustedSize(18),
    lineHeight: 22,
    fontWeight: REGULAR_WEIGHT,
    maxFontSizeMultiplier: 1.4,
  },
  body2: {
    family: platformFontFamily('regular'),
    fontSize: adjustedSize(16),
    lineHeight: 20,
    fontWeight: REGULAR_WEIGHT,
    maxFontSizeMultiplier: 1.4,
  },
  body3: {
    family: platformFontFamily('regular'),
    fontSize: adjustedSize(12),
    lineHeight: 14,
    fontWeight: REGULAR_WEIGHT,
    maxFontSizeMultiplier: 1.4,
  },
  buttonLabel1: {
    family: platformFontFamily('bold'),
    fontSize: adjustedSize(22),
    lineHeight: adjustedSize(24),
    fontWeight: BOLD_WEIGHT,
    maxFontSizeMultiplier: 1.2,
  },
  buttonLabel2: {
    family: platformFontFamily('medium'),
    fontSize: adjustedSize(16),
    lineHeight: adjustedSize(20),
    fontWeight: MEDIUM_WEIGHT,
    maxFontSizeMultiplier: 1.2,
  },
} as const

// TODO: Tamagui breaks font weights on Android if face *not* defined
// but breaks iOS if face is defined
const face = {
  [defaultWeights.regular]: { normal: jetBrainsRegular },
  [defaultWeights.medium]: { normal: jetBrainsMedium },
  [defaultWeights.bold]: { normal: jetBrainsBold },
}

// for now tamagui is inferring all the font size from body, but we have differences in the diff fonts
// so i'm filling in blanks (adding bold here), but will need to fix this properly in tamagui...

export const headingFont = createFont({
  family: jetBrainsBold,
  ...(isAndroid ? { face } : null),
  size: {
    large: fonts.heading1.fontSize,
  },
  weight: defaultWeights,
  lineHeight: {
    large: fonts.heading1.lineHeight,
  },
})

export const bodyFont = createFont({
  family: jetBrainsRegular,
  ...(isAndroid ? { face } : null),
  size: {
    small: fonts.body3.fontSize,
    medium: fonts.body2.fontSize,
    true: fonts.body2.fontSize,
    large: fonts.body1.fontSize,
  },
  weight: defaultWeights,
  lineHeight: {
    small: fonts.body3.lineHeight,
    medium: fonts.body2.lineHeight,
    true: fonts.body2.lineHeight,
    large: fonts.body1.lineHeight,
  },
})

export const buttonFont = createFont({
  family: jetBrainsBold,
  size: {
    medium: fonts.buttonLabel2.fontSize,
    large: fonts.buttonLabel1.fontSize,
    true: fonts.buttonLabel2.fontSize,
  },
  weight: {
    ...defaultWeights,
    true: MEDIUM_WEIGHT,
  },
  lineHeight: {
    medium: fonts.buttonLabel2.lineHeight,
    large: fonts.buttonLabel1.lineHeight,
    true: fonts.buttonLabel2.lineHeight,
  },
})

export const allFonts = {
  heading: headingFont,
  body: bodyFont,
  button: buttonFont,
}
