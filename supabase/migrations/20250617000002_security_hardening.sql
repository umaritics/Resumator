-- Harden trigger/helper functions flagged by Supabase security advisors.

alter function public.set_updated_at() set search_path = public;

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon, authenticated;
