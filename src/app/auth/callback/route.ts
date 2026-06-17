/**
 * OAuth PKCE callback Route Handler.
 *
 * Exchanges the authorization `code` query param for a Supabase session after Google
 * (or email-link) redirect. Exists as a dedicated route so redirect URLs stay stable
 * across environments (`/auth/callback`).
 *
 * GET /auth/callback?code=...&next=/
 *
 * Responses:
 * - 302 → `next` path on success (default `/`)
 * - 302 → `/auth?error=auth_callback_failed` when code missing or exchange fails
 *
 * External dependencies: Supabase Auth API via server client cookies.
 */
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_callback_failed`);
}
