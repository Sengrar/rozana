-- 0002_admin_members.sql
-- Super admin tools for the people in a shop (memberships).
-- Functions only: no table, column or policy changes.
--
-- Why functions: the app cannot read auth.users (where emails live), so the
-- platform team needs these security definer functions to see who is in a
-- shop and to add someone by email. Both refuse anyone who is not a
-- platform admin.

-- List a shop's people with their email.
create or replace function public.admin_list_members(p_tenant uuid)
returns table (
  membership_id uuid,
  user_id       uuid,
  email         text,
  role          public.member_role,
  is_active     boolean,
  created_at    timestamptz
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_platform_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  return query
    select m.id, m.user_id, u.email::text, m.role, m.is_active, m.created_at
    from public.memberships m
    join auth.users u on u.id = m.user_id
    where m.tenant_id = p_tenant
    order by m.created_at;
end;
$$;

-- Give an existing login a role in a shop. Calling it again for the same
-- person changes their role and makes the membership active again.
create or replace function public.admin_set_member(
  p_tenant uuid,
  p_email  text,
  p_role   public.member_role
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_user       uuid;
  v_membership uuid;
begin
  if not public.is_platform_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  select u.id into v_user
  from auth.users u
  where lower(u.email) = lower(trim(p_email));

  if v_user is null then
    raise exception 'no account with email %', p_email using errcode = 'P0002';
  end if;

  insert into public.memberships (tenant_id, user_id, role)
  values (p_tenant, v_user, p_role)
  on conflict (tenant_id, user_id)
  do update set role = excluded.role, is_active = true
  returning id into v_membership;

  return v_membership;
end;
$$;

revoke all on function public.admin_list_members(uuid) from public, anon;
revoke all on function public.admin_set_member(uuid, text, public.member_role) from public, anon;
grant execute on function public.admin_list_members(uuid) to authenticated;
grant execute on function public.admin_set_member(uuid, text, public.member_role) to authenticated;
