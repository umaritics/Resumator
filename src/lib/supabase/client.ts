/**
 * Browser Supabase client factory for Client Components.
 *
 * Exists to isolate `@supabase/ssr` construction from UI modules so auth pages and
 * the navbar share one configuration surface (project URL + publishable key).
 *
 * @returns Supabase client bound to browser cookie storage managed by SSR middleware.
 * @throws Error at runtime if `NEXT_PUBLIC_SUPABASE_*` env vars are missing (build-time
 *   substitution failure).
 *
 * External dependencies: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
 * Mutations: none — each call creates a client instance; session state lives in cookies.
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
