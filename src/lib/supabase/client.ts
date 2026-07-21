/**
 * Browser Supabase client factory for Client Components.
 *
 * Call only from browser event handlers or `useEffect` — not during render —
 * so static prerender does not require env vars at module evaluation time.
 *
 * External dependencies: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them in Vercel → Settings → Environment Variables (Production + Preview), then Redeploy.",
    );
  }

  return createBrowserClient(url, key);
}
