import { TamaguiProvider as OGTamaguiProvider, TamaguiProviderProps } from 'tamagui'
import config from 'ui/src/tamagui.config'

export function TamaguiProvider({ children, ...rest }: Omit<TamaguiProviderProps, 'config'>): JSX.Element {
  return (
    <OGTamaguiProvider config={config} defaultTheme="dark" {...rest}>
      {children}
    </OGTamaguiProvider>
  )
}
