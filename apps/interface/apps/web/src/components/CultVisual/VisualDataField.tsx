import { Flex, styled, Text } from 'ui/src'
import { UploadedImageField } from 'components/CultVisual/types'

const VisualDataValue = styled(Text, {
  variant: 'body2',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  color: '$surface1',
  px: '$padding6',

  "$platform-web": {
    color: '$surface1',
  },

  variants: {
    status: {
      ok: {
        background: '$accent1',
      },
      warning: {
        background: '$statusWarning',
      },
      critical: {
        background: '$statusCritical',
      },
    },
  },
})

const Reason = styled(Text, {
  variant: 'body3',

  variants: {
    status: {
      warning: {
        color: '$statusWarning',
      },
      critical: {
        color: '$statusCritical',
      },
    },
  },
})

type VisualDataFieldProps<T> = UploadedImageField<T> & {
  fieldName: string
  formatter: (value: T) => string
}

export function VisualDataField<T>({ fieldName, formatter, value, ...props }: VisualDataFieldProps<T>) {
  return (
    <Flex alignItems="flex-start" gap={2}>
      <Flex flexDirection="row" justifyContent="space-between" width="100%" gap="$gap16">
        <Text variant="body2">{fieldName}:</Text>
        <VisualDataValue status={props.status}>{formatter(value)}</VisualDataValue>
      </Flex>

      {props.status !== 'ok' && <Reason variant="body3" status={props.status}>{props.reason}</Reason>}
    </Flex>
  )
}
