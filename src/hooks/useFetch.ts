import { useQuery } from '@tanstack/react-query'

export function useFetch<T>(queryKey: string, url: string) {
  return useQuery<T>({
    queryKey: [queryKey],
    queryFn: async () => {
      return (await fetch(url)).json()
    },
  })
}
