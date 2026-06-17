/**
 * Next.js middleware entrypoint for global Supabase session refresh.
 *
 * Matcher excludes static assets to avoid unnecessary JWKS/session work on images and
 * Next internals. All dynamic routes inherit refreshed cookies automatically.
 */
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
