"use client"

import React, { useState } from "react"
import { AuthProvider } from "@/providers/AuthProvider"
import { BrandingProvider } from "@/providers/BrandingProvider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }))

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrandingProvider>
          {children}
        </BrandingProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

