create type public.app_role as enum ('coach', 'eleve');

create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now()
);

comment on table public.user_roles is
  'Trusted application role for each authenticated NextPoint user.';

create unique index uniq_user_roles_single_coach
  on public.user_roles (role)
  where role = 'coach';

alter table public.user_roles enable row level security;

revoke all on table public.user_roles from anon;
revoke insert, update, delete on table public.user_roles from authenticated;
grant select on table public.user_roles to authenticated;

create policy user_roles_select_own
  on public.user_roles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

insert into public.user_roles (user_id, role)
select
  id,
  case
    when raw_user_meta_data ->> 'role' in ('coach', 'eleve')
      then (raw_user_meta_data ->> 'role')::public.app_role
    else 'eleve'::public.app_role
  end
from auth.users
on conflict (user_id) do nothing;

create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text;
begin
  requested_role := new.raw_user_meta_data ->> 'role';

  if requested_role not in ('coach', 'eleve') then
    raise exception 'invalid application role'
      using errcode = '22023';
  end if;

  insert into public.user_roles (user_id, role)
  values (new.id, requested_role::public.app_role);

  return new;
end;
$$;

revoke all on function public.handle_new_user_role() from public;

create trigger on_auth_user_created_set_role
  after insert on auth.users
  for each row execute function public.handle_new_user_role();
