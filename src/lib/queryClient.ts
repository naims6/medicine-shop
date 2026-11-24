import { QueryClient } from "@tanstack/react-query";
import { isApiError } from "@/lib/apiErrors";

/**
 * Factory for the TanStack Query client. Called once per browser session (see
 * AppProviders) via a useState initializer so the instance is stable across
 * re-renders and never shared across server requests.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (
            isApiError(error) &&
            error.statusCode >= 400 &&
            error.statusCode < 500
          ) {
            return false;
          }
          return failureCount < 1;
        },
        refetchOnWindowFocus: false,
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
