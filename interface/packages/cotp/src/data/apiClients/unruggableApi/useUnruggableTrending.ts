import { UseQueryResult, useQuery } from '@tanstack/react-query'
import {
  UNRUGGABLE_API_CACHE_KEY,
  UnruggableTrendingResponse,
  fetchTrending,
} from 'cotp/src/data/apiClients/unruggableApi/unruggableApiClient'
import { UseQueryApiHelperHookArgs } from 'cotp/src/data/apiClients/types'

export function useUnruggableTrending({
  ...rest
}: UseQueryApiHelperHookArgs<{}, UnruggableTrendingResponse>): UseQueryResult<UnruggableTrendingResponse> {
  const queryKey = [UNRUGGABLE_API_CACHE_KEY, '/trending']

  return useQuery<UnruggableTrendingResponse>({
    queryKey,
    queryFn: async (): ReturnType<typeof fetchTrending> => await fetchTrending(),
    ...rest,
  })
}
