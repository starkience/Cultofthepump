import type { IconProps as TamaguiIconProps } from '@tamagui/helpers-icon'
import { createElement, forwardRef } from 'react'
import { Svg, SvgProps } from 'react-native-svg'
import { ColorTokens, SpecificTokens, Stack, ThemeKeys, isWeb, styled, usePropsAndStyle } from 'tamagui'
import { DynamicColor } from 'ui/src/hooks/useSigilColors'
import { IconSizeTokens } from 'ui/src/theme'

type SvgPropsWithRef = SvgProps & { ref: React.ForwardedRef<Svg>; style?: { color?: string } }

type CSSPercentage = `${number}%`

export type IconProps = Omit<Omit<TamaguiIconProps, 'size'>, 'color'> & {
  size?: IconSizeTokens | number | CSSPercentage
  // we need the string & {} to allow strings but not lose the intellisense autocomplete
  // eslint-disable-next-line @typescript-eslint/ban-types
  color?: (ColorTokens | ThemeKeys | (string & {})) | DynamicColor | null
  Component?: React.FunctionComponent<SvgPropsWithRef>
}

function isCSSPercentage(value: string): value is CSSPercentage {
  return /^-?\d*\.?\d+%$/.test(value)
}

const getSize = <Val extends SpecificTokens | number>(val: Val): { width: Val; height?: Val } => {
  // if the value is a string and a percentage, we only set the width and let the height be auto
  if (typeof val === 'string' && isCSSPercentage(val)) {
    return {
      width: val,
    }
  }

  return {
    width: val,
    height: val,
  }
}

// used by our usePropsAndStyle to resolve a variant
const IconFrame = styled(Stack, {
  variants: {
    size: {
      '...': getSize,
    },
  },
})

export type IconPropsWithRef = IconProps & React.RefAttributes<Svg>

export type GeneratedIcon = React.ForwardRefExoticComponent<IconPropsWithRef>

export function createIcon({
  name,
  getIcon,
  defaultFill,
}: {
  name: string
  getIcon: (props: SvgPropsWithRef) => JSX.Element
  defaultFill?: string
}): GeneratedIcon {
  const Icon = forwardRef<Svg, IconProps>((propsIn: IconProps, ref) => {
    const [props, style] = usePropsAndStyle(
      {
        color: defaultFill ?? (isWeb ? 'currentColor' : undefined),
        size: '$icon.8',
        strokeWidth: 8,
        ...propsIn,
      },
      {
        resolveValues: 'value',
        forComponent: IconFrame,
      },
    )

    const svgProps: SvgPropsWithRef = {
      ref,
      ...props,
      // @ts-expect-error this type is hard to map but its right
      style,
    }

    if (props.Component) {
      return createElement(props.Component, svgProps)
    }

    return getIcon(svgProps)
  })

  Icon.displayName = name

  return Icon
}
