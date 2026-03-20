import { Case } from 'cotp/src/constants/misc'
import { selector } from 'starknet'

export function getCasedEntrypoint(snakeCasedEntrypoint: string, outputCase: Case): string {
  switch (outputCase) {
    case 'snake':
      return snakeCasedEntrypoint

    case 'camel':
      return snakeCasedEntrypoint
        .toLowerCase()
        .replace(/_[a-z]/g, match => match.charAt(1).toUpperCase())
  }

  return ''
}

export function getCasedSelector(snakeCasedEntrypoint: string, outputCase: Case): string {
  return selector.getSelector(getCasedEntrypoint(snakeCasedEntrypoint, outputCase))
}
