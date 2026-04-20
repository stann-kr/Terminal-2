'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,   // 5분: 캐시 신선도 유지
            gcTime: 1000 * 60 * 30,     // 30분: 언마운트 후 메모리 유지
            retry: 1,
            refetchOnWindowFocus: false, // 탭 전환 시 불필요한 재페칭 방지
          },
        },
      })
  )

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
