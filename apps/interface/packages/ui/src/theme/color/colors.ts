const accentColors = {
  pinkLight: '#FEF4FF',
  pinkPastel: '#FDAFF0',
  pinkBase: '#FC74FE',
  pinkVibrant: '#F50DB4',
  pinkDark: '#361A37',

  redLight: '#FFF2F1',
  redPastel: '#FDCFC4',
  redBase: '#FF5F52',
  redVibrant: '#FF0000',
  redDark: '#220D0C',

  orangeLight: '#FEF5EA',
  orangePastel: '#FFE8BC',
  orangeBase: '#FF8934',
  orangeVibrant: '#FF4D00',
  orangeDark: '#371B0C',

  yellowLight: '#FFFE8B',
  yellowPastel: '#FFF8B4',
  yellowBase: '#FFBF17',
  yellowVibrant: '#FFF612',
  yellowDark: '#1F1E02',

  brownLight: '#F7F6F1',
  brownPastel: '#E2E0CD',
  brownBase: '#85754A',
  brownVibrant: '#996F01',
  brownDark: '#231E0F',

  greenLight: '#EEFBF1',
  greenPastel: '#C2E7D0',
  greenBase: '#0C8911',
  greenVibrant: '#21C95E',
  greenDark: '#0F2C1A',

  limeLight: '#F7FEEB',
  limePastel: '#E4F6C4',
  limeBase: '#78E744',
  limeVibrant: '#B1F13C',
  limeDark: '#232917',

  turquoiseLight: '#F7FEEB',
  turquoisePastel: '#CAFFDF',
  turquoiseBase: '#00C3A0',
  turquoiseVibrant: '#5CFE9D',
  turquoiseDark: '#1A2A21',

  cyanLight: '#EBF8FF',
  cyanPastel: '#B9E3F8',
  cyanBase: '#23A3FF',
  cyanVibrant: '#3ADCFF',
  cyanDark: '#15242B',

  blueLight: '#EFF4FF',
  bluePastel: '#D0D9F8',
  blueBase: '#4981FF',
  blueVibrant: '#0047FF',
  blueDark: '#10143D',

  purpleLight: '#FAF5FF',
  purplePastel: '#E9D8FD',
  purpleBase: '#9E62FF',
  purpleVibrant: '#4300B0',
  purpleDark: '#1A0040',
}

export const colors = {
  white: '#FFFFFF',
  black: '#000000',
  scrim: 'rgba(0,0,0,0.60)',

  ...accentColors,
}

// Core brand colors
const sigilDark = {
  none: 'transparent',

  white: colors.white,
  black: colors.black,
  scrim: colors.scrim,

  neutral1: colors.white,
  neutral1Hovered: '#F9F9F9',
  neutral2: '#90919C',
  neutral2Hovered: '#ADADAD',
  neutral3: '#5E5E5E',
  neutral3Hovered: '#6B6B6B',

  surface1: '#06070A',
  surface1Hovered: 'rgba(20,20,20,1.00)',
  surface2: '#0F0F11',
  surface2Hovered: 'rgba(32,32,32,1.00)',
  surface3: '#242426',
  surface3Hovered: 'rgba(255,255,255,0.16)',

  accent1: '#2DE94D',
  accent1Hovered: '#05CC41',

  accent1Gradiant: 'linear-gradient(180deg, #64FC7B 0%, #00E931 50%, #05CC41 100%)',

  statusWarning: '#ff9605',
  statusCritical: '#e90010',
}

export const colorsDark = {
  none: 'transparent',

  white: sigilDark.white,
  black: sigilDark.black,

  surface1: sigilDark.surface1,
  surface1Hovered: sigilDark.surface1Hovered,
  surface2: sigilDark.surface2,
  surface2Hovered: sigilDark.surface2Hovered,
  surface3: sigilDark.surface3,
  surface3Hovered: sigilDark.surface3Hovered,

  scrim: sigilDark.scrim,

  neutral1: sigilDark.neutral1,
  neutral1Hovered: sigilDark.neutral1Hovered,
  neutral2: sigilDark.neutral2,
  neutral2Hovered: sigilDark.neutral2Hovered,
  neutral3: sigilDark.neutral3,
  neutral3Hovered: sigilDark.neutral3Hovered,

  accent1: sigilDark.accent1,
  accent1Hovered: sigilDark.accent1Hovered,

  accent1Gradiant: sigilDark.accent1Gradiant,

  statusCritical: sigilDark.statusCritical,

  statusWarning: sigilDark.statusWarning,
}

export type ColorKeys = keyof typeof colorsDark
