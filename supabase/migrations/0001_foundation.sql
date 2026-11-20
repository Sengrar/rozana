-- 0001_foundation.sql
-- Platform tables: plans, tenants, subscriptions, coupons, memberships.
-- Every table has row-level security. Money is integer paise.

create extension if not exists pgcrypto;

-- ---------- Types ----------
create type public.member_role as enum
  ('merchant_admin', 'merchant_staff', 'delivery', 'customer');
create type public.subscription_status as enum
  ('trialing', 'active', 'past_due', 'paused', 'cancelled');
create type public.coupon_kind as enum
  ('percent_off', 'amount_off', 'extra_trial_days');

-- ---------- Tables ----------
create table public.platform_admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.plans (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique,
  name              text not null,
  price_month_paise integer not null check (price_month_paise >= 0),
  price_year_paise  integer not null check (price_year_paise >= 0),
  limits            jsonb not null default '{}'::jsonb,   -- null value = unlimited
  features          jsonb not null default '{}'::jsonb,
  is_public         boolean not null default true,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now()
);

create table public.tenants (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique
                check (slug ~ '^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$')
                check (slug not in ('www', 'app', 'admin', 'api', 'store', 'help')),
  name          text not null,
  business_type text,
  phone         text,
  theme         jsonb not null default '{}'::jsonb,
  settings      jsonb not null default '{}'::jsonb,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create table public.coupons (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique check (code = upper(code)),
  kind            public.coupon_kind not null,
  value           integer not null check (value > 0),  -- percent, paise, or days
  plan_id         uuid references public.plans (id),   -- null = any plan
  max_redemptions integer,
  redeemed_count  integer not null default 0,
  valid_from      timestamptz not null default now(),
  valid_until     timestamptz,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

create table public.subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null unique references public.tenants (id) on delete cascade,
  plan_id            uuid not null references public.plans (id),
  status             public.subscription_status not null default 'trialing',
  billing_cycle      text not null default 'month' check (billing_cycle in ('month', 'year')),
  trial_ends_at      timestamptz,
  current_period_end timestamptz,
  coupon_id          uuid references public.coupons (id),
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table public.coupon_redemptions (
  id          uuid primary key default gen_random_uuid(),
  coupon_id   uuid not null references public.coupons (id),
  tenant_id   uuid not null references public.tenants (id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  unique (coupon_id, tenant_id)
);

create table public.memberships (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       public.member_role not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);
create index memberships_user_id_idx on public.memberships (user_id);

-- ---------- Helper functions ----------
-- security definer so policies can check membership without recursing into RLS.
create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.platform_admins
    where user_id = (select auth.uid())
  );
$$;

create or replace function public.is_tenant_member(p_tenant uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships m
    where m.tenant_id = p_tenant
      and m.user_id = (select auth.uid())
      and m.is_active
  );
$$;

create or replace function public.has_tenant_role(p_tenant uuid, p_roles public.member_role[])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships m
    where m.tenant_id = p_tenant
      and m.user_id = (select auth.uid())
      and m.is_active
      and m.role = any (p_roles)
  );
$$;

-- Public storefront lookup: exposes only safe columns.
create or replace function public.tenant_by_slug(p_slug text)
returns table (id uuid, slug text, name text, theme jsonb)
language sql stable security definer set search_path = '' as $$
  select t.id, t.slug, t.name, t.theme
  from public.tenants t
  where t.slug = lower(p_slug) and t.is_active;
$$;

-- Super admin: create a tenant and start its trial in one step.
create or replace function public.admin_create_tenant(
  p_slug text,
  p_name text,
  p_plan_code text default 'growth',
  p_trial_days integer default 15
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_tenant uuid;
  v_plan   uuid;
begin
  if not public.is_platform_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  select id into v_plan from public.plans where code = p_plan_code;
  if v_plan is null then
    raise exception 'unknown plan: %', p_plan_code;
  end if;

  insert into public.tenants (slug, name)
  values (lower(p_slug), p_name)
  returning id into v_tenant;

  insert into public.subscriptions (tenant_id, plan_id, status, trial_ends_at)
  values (v_tenant, v_plan, 'trialing', now() + make_interval(days => p_trial_days));

  return v_tenant;
end;
$$;

revoke all on function public.admin_create_tenant(text, text, text, integer) from public, anon;
grant execute on function public.admin_create_tenant(text, text, text, integer) to authenticated;
grant execute on function public.tenant_by_slug(text) to anon, authenticated;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ---------- Row-level security ----------
alter table public.platform_admins    enable row level security;
alter table public.plans              enable row level security;
alter table public.tenants            enable row level security;
alter table public.coupons            enable row level security;
alter table public.subscriptions      enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.memberships        enable row level security;

-- platform_admins: you can see only your own row. Rows are added by SQL only.
create policy platform_admins_select_own on public.platform_admins
  for select to authenticated
  using (user_id = (select auth.uid()));

-- plans: public plans readable by everyone; only super admin writes.
create policy plans_read on public.plans
  for select to anon, authenticated
  using (is_public or public.is_platform_admin());
create policy plans_admin_write on public.plans
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- tenants: members read their own tenant; only super admin writes (M0).
create policy tenants_read on public.tenants
  for select to authenticated
  using (public.is_platform_admin() or public.is_tenant_member(id));
create policy tenants_admin_write on public.tenants
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- subscriptions: merchant admin/staff read their own; only super admin writes.
create policy subscriptions_read on public.subscriptions
  for select to authenticated
  using (
    public.is_platform_admin()
    or public.has_tenant_role(
         tenant_id,
         array['merchant_admin', 'merchant_staff']::public.member_role[])
  );
create policy subscriptions_admin_write on public.subscriptions
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- coupons and redemptions: super admin only.
create policy coupons_admin_all on public.coupons
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());
create policy coupon_redemptions_admin_all on public.coupon_redemptions
  for all to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- memberships: see your own; merchant admin manages their tenant's; super admin all.
create policy memberships_read on public.memberships
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or public.is_platform_admin()
    or public.has_tenant_role(tenant_id, array['merchant_admin']::public.member_role[])
  );
create policy memberships_write on public.memberships
  for all to authenticated
  using (
    public.is_platform_admin()
    or public.has_tenant_role(tenant_id, array['merchant_admin']::public.member_role[])
  )
  with check (
    public.is_platform_admin()
    or public.has_tenant_role(tenant_id, array['merchant_admin']::public.member_role[])
  );

-- ---------- Grants (explicit, in case the project does not grant by default) ----------
grant usage on schema public to anon, authenticated;
grant select on public.plans to anon;
grant select on public.platform_admins to authenticated;
grant select, insert, update, delete on
  public.plans, public.tenants, public.coupons, public.subscriptions,
  public.coupon_redemptions, public.memberships
  to authenticated;

-- ---------- Seed plans (PROPOSED prices, see docs/PRICING.md) ----------
insert into public.plans
  (code, name, price_month_paise, price_year_paise, sort_order, limits, features)
values
  ('starter', 'Starter', 49900, 499900, 1,
   '{"customers": 100, "staff_logins": 1, "delivery_logins": 1, "wa_messages": 0}',
   '{"standing_orders": false, "price_lists": false, "inventory": false, "routes": false, "gst_invoice": false, "theming": false, "branches": false, "custom_domain": false, "reports": false}'),
  ('growth', 'Growth', 99900, 999900, 2,
   '{"customers": 500, "staff_logins": 3, "delivery_logins": 3, "wa_messages": 1000}',
   '{"standing_orders": true, "price_lists": true, "inventory": true, "routes": true, "gst_invoice": true, "theming": true, "branches": false, "custom_domain": false, "reports": false}'),
  ('pro', 'Pro', 199900, 1999900, 3,
   '{"customers": null, "staff_logins": null, "delivery_logins": null, "wa_messages": 5000}',
   '{"standing_orders": true, "price_lists": true, "inventory": true, "routes": true, "gst_invoice": true, "theming": true, "branches": true, "custom_domain": true, "reports": true}')
on conflict (code) do nothing;