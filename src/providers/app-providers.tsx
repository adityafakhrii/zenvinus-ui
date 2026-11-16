/**
 * Every app-wide provider, in the order they depend on each other: app state (Redux), API data (TanStack Query),
 * language (reads Redux, reloads queries), session.
 * Mounted once by src/pages/_app.tsx.
 */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth';
import { LanguageProvider } from '@/i18n';
import { isUnavailableError } from '@/services/api';
import { StoreProvider } from './store-provider';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // WHY: When the API cannot be reached (server down, offline) keep retrying in the background with backoff,
            // so pages stay on their loading skeleton and fill in by themselves once it is back. Other errors
            // (404, validation) are real answers: retry once at most
            retry: (failureCount, error) => (isUnavailableError(error) ? true : failureCount < 1),
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 15_000),
            refetchOnWindowFocus: false,
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <StoreProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </StoreProvider>
  );
}
