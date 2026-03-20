import { WindowCard } from 'components/Card/WindowCard'
import { Flex, Text, TextAreaInput, TextInput } from 'ui/src'
import z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useCleanCultData, useSetCultData } from 'state/summon/hooks'

// zod schemes

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
})

export function CultData() {
  // form
  const {
    control,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      symbol: '',
      name: '',
      manifesto: '',
    },
    mode: 'onChange',
    shouldFocusError: false,
  })

  // push data to global state
  const setCultData = useSetCultData()
  const cleanCultData = useCleanCultData()

  const values = watch()

  useEffect(() => {
    if (schema.safeParse(values).success) {
      setCultData(values.name, values.symbol, values.manifesto)
    } else {
      cleanCultData()
    }
  }, [values.symbol, values.name, values.manifesto, ])

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
          <Text variant="body3" color="$redVibrant" >{errors.symbol?.message ?? ' '}</Text>
        </Flex>

        <Flex gap="$gap4">
          <Controller
            name="name"
            control={control}
            render={({ field: { onChange, value } }) =>
              <TextInput width="auto" placeholder="Full Name" onChange={onChange} value={value} />
            }
          />
          <Text variant="body3" color="$redVibrant" >{errors.name?.message ?? ' '}</Text>
        </Flex>

        <Flex gap="$gap4">
          <Controller
            name="manifesto"
            control={control}
            render={({ field: { onChange, value } }) =>
              <TextAreaInput width="auto" placeholder="Manifesto (optional)" onChange={onChange} value={value} />
            }
          />
          <Text variant="body3" color="$redVibrant" >{errors.manifesto?.message ?? ' '}</Text>
        </Flex>
      </Flex>
    </WindowCard>
  )
}
