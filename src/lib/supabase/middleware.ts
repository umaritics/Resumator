/**
 * Supabase session refresh helper invoked by Next.js middleware.
 *
 * Calls `auth.getUser()` on every matched request so expired JWTs refresh before Server
 * Components or Route Handlers read stale sessions. Chosen over `getSession()` because
 * Supabase documents `getUser()` as the server-side validation primitive.
 *
 * @param request - Incoming Next.js request including auth cookies.
 * @returns Response with potentially updated Set-Cookie headers.
 *
 * Side effects: mutates `request.cookies` and clones a new `NextResponse` when tokens
 * rotate. Does not redirect — auth gating is route-specific (Phase 5 dashboard).
 *
 * External dependencies: `NEXT_PUBLIC_SUPABASE_*` env vars.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Allow builds / misconfigured previews to serve pages without auth refresh.
  if (!url || !key) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();

  return supabaseResponse;
}
