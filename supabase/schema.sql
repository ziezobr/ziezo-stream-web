-- Snapshot do esquema aplicado ao projeto Supabase.
create table public.ziezo_account_state (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null default '{"profiles":[],"library":[],"titles":[]}'::jsonb
  check (jsonb_typeof(payload)='object' and octet_length(payload::text)<1048576),
 revision bigint not null default 0 check (revision>=0)
);
alter table public.ziezo_account_state enable row level security;
revoke all on public.ziezo_account_state from anon;
grant select,insert,update,delete on public.ziezo_account_state to authenticated;
create policy own_select on public.ziezo_account_state for select to authenticated using ((select auth.uid())=user_id);
create policy own_insert on public.ziezo_account_state for insert to authenticated with check ((select auth.uid())=user_id);
create policy own_update on public.ziezo_account_state for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy own_delete on public.ziezo_account_state for delete to authenticated using ((select auth.uid())=user_id);
