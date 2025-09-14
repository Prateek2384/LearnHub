import { createBrowserClient } from "@supabase/ssr"
import { cache } from "../performance/cache"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createOptimizedClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      realtime: {
        params: {
          eventsPerSecond: 10, // Limit realtime events
        },
      },
      global: {
        headers: {
          "x-client-info": "learning-platform@1.0.0",
        },
      },
    },
  )

  return supabaseClient
}

export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttlMs: number = 5 * 60 * 1000, // 5 minutes default
): Promise<T> {
  const cached = cache.get(key)
  if (cached) {
    return cached
  }

  const result = await queryFn()
  cache.set(key, result, ttlMs)
  return result
}
