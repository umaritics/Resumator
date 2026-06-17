/**
 * Server Supabase client for Route Handlers and Server Components.
 *
 * Uses Next.js `cookies()` so Supabase sessions remain in httpOnly cookies instead of
 * browser-accessible storage — the primary XSS mitigation for auth tokens.
 *
 * @returns Async-initialized Supabase client with read/write access to the request cookie jar.
 *
 * Error behavior: `setAll` silently no-ops when invoked from a Server Component context
 * where cookies are read-only; session refresh is delegated to `src/middleware.ts`.
 *
 * External dependencies: request cookie store, `NEXT_PUBLIC_SUPABASE_*` env vars.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll is called from a Server Component; middleware refreshes sessions.
          }
        },
      },
    },
  );
}
