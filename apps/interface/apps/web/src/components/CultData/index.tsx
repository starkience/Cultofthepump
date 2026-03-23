import { WindowCard } from 'components/Card/WindowCard'
import { Flex, Text, TextAreaInput, TextInput } from 'ui/src'
import z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useCleanCultData, useSetCultData } from 'state/summon/hooks'

function parseStrkToWei(value: string): string | null {
  try {
    const n = Number(value)
    if (isNaN(n) || n < 0) return null
    if (n === 0) return null
    const [intPart, fracPart = ''] = value.split('.')
    const frac = fracPart.padEnd(18, '0').slice(0, 18)
    return (BigInt(intPart) * BigInt(10 ** 18) + BigInt(frac)).toString()
  } catch {
    return null
  }
}

const schema = z.object({
  symbol: z
    .string()
    .min(1, 'Symbol must be at least 1 character.')
    .max(6, 'Symbol must be less than 7 characters.')
    .regex(/^[A-Z0-9]+$/, 'Symbol must be uppercase letters and numbers only.'),
  name: z
    .string()
    .min(1, 'Name must be at least 1 character.')
    .max(31, 'Name must be less than 32 characters.'),
  manifesto: z
    .string()
    .max(260, 'Description must be less than 500 characters.'),
  sniping: z
    .string()
    .optional()
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), 'Must be a valid STRK amount.'),
})

export function CultData() {
  const {
    control,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { symbol: '', name: '', manifesto: '', sniping: '' },
    mode: 'onChange',
    shouldFocusError: false,
  })

  const setCultData = useSetCultData()
  const cleanCultData = useCleanCultData()
  const values = watch()

  useEffect(() => {
    const base = { symbol: values.symbol, name: values.name, manifesto: values.manifesto ?? '' }
    if (schema.safeParse(values).success) {
      const snipingWei = values.sniping ? parseStrkToWei(values.sniping) : null
      setCultData(values.name, values.symbol, values.manifesto ?? '', snipingWei)
    } else {
      cleanCultData()
    }
  }, [values.symbol, values.name, values.manifesto, values.sniping])

  return (
    <WindowCard title="Cult Data" backgroundColor="$surface2">
      <Flex gap="$gap16">
        <Flex gap="$gap4">
          <Controller
            name="symbol"
            control={control}
            render={({ field: { onChange, value } }) =>
              <TextInput width="auto" placeholder="SYMBOL" onChange={onChange} value={value} />
            }
          />
          <Text variant="body3" color="$redVibrant">{errors.symbol?.message ?? ' '}</Text>
        </Flex>

        <Flex gap="$gap4">
          <Controller
            name="name"
            control={control}
            render={({ field: { onChange, value } }) =>
              <TextInput width="auto" placeholder="Full Name" onChange={onChange} value={value} />
            }
          />
          <Text variant="body3" color="$redVibrant">{errors.name?.message ?? ' '}</Text>
        </Flex>

        <Flex gap="$gap4">
          <Controller
            name="manifesto"
            control={control}
            render={({ field: { onChange, value } }) =>
              <TextAreaInput width="auto" placeholder="Manifesto (optional)" onChange={onChange} value={value} />
            }
          />
          <Text variant="body3" color="$redVibrant">{errors.manifesto?.message ?? ' '}</Text>
        </Flex>

        <Flex gap="$gap4">
          <Text variant="body3" color="$neutral2">Creator pre-buy (optional)</Text>
          <Controller
            name="sniping"
            control={control}
            render={({ field: { onChange, value } }) =>
              <TextInput
                width="auto"
                placeholder="0 STRK"
                onChange={onChange}
                value={value}
                keyboardType="decimal-pad"
              />
            }
          />
          <Text variant="body3" color="$neutral2">
            Buy tokens at launch before anyone else. Paid on top of the ritual fee.
          </Text>
          {errors.sniping && (
            <Text variant="body3" color="$redVibrant">{errors.sniping.message}</Text>
          )}
        </Flex>
      </Flex>
    </WindowCard>
  )
}
