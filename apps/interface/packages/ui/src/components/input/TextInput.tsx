import { forwardRef } from 'react'
import { Input as TamaguiInput, styled, TextArea as TamaguiTextArea, InputProps, TextAreaProps, createStyledContext } from 'ui/src'

const InputContext = createStyledContext({
  borderColor: '$borderColor',
  borderWidth: 1,
  borderStyle: 'solid',
  px: '$spacing16',
  py: '$padding12',
  backgroundColor: '$surface1',
  height: 'auto',
  fontSize: '$true',
  fontWeight: '$true',
  placeholderTextColor: '$neutral2',

  "$platform-web": {
    outline: 'none',
    color: '$neutral1',
  },
})

const StyledInput = styled(TamaguiInput, {
  context: InputContext,
})

const StyledTextArea = styled(TamaguiTextArea, {
  context: InputContext,
})

type Input = TamaguiInput

interface TextInputProps extends InputProps {
  placeholder?: string
  value?: string
}

export const TextInput = forwardRef<Input, React.PropsWithChildren<TextInputProps>>(({ placeholder, ...props }, ref) => {
  return (
    <StyledInput ref={ref} placeholder={placeholder} {...props} />
  )
})

interface TextAreaInputProps extends TextAreaProps {
  placeholder?: string
  value?: string
}

export const TextAreaInput = forwardRef<Input, React.PropsWithChildren<TextAreaInputProps>>(({ placeholder, value, ...props }, ref) => {
  return (
    <StyledTextArea ref={ref} placeholder={placeholder} {...props} />
  )
})
