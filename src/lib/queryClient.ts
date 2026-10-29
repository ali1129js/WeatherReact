import { QueryClient } from "@tanstack/react-query";

export function createQueryClient(retry: number | false = 1): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry, refetchOnWindowFocus: false },
    },
  });
}
