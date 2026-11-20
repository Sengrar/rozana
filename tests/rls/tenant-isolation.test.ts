/**
 * Tenant isolation (M0 step 5).
 *
 * Creates two shops, A and B, each with one merchant-admin login, in the
 * Supabase project named in .env.local. Then it logs in as each person with
 * the publishable key, exactly as the app does, and proves that row-level
 * security shows them their own shop and none of the other shop's tenants,
 * subscriptions or memberships rows. It also checks they cannot change the
 * other shop, and that a visitor who is not logged in sees nothing.
 *
 * Setup and clean-up use SUPABASE_SECRET_KEY, which bypasses row-level
 * security. They only touch what this test creates: shop subdomains and login
 * emails that start with "rlstest-".
 */
import { randomBytes } from "node:crypto";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Database } from "../../src/lib/supabase/database.types";

type Client = SupabaseClient<Database>;
type Label = "A" | "B";

type Person = {
  userId: string;
  tenantId: string;
  subscriptionId: string;
  membershipId: string;
  /** Logged in as this person, with the publishable key. */
  db: Client;
};

const PREFIX = "rlstest-";
const RUN = `${PREFIX}${randomBytes(4).toString("hex")}-`;

const noSession = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};

function setting(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} is missing. Add it to .env.local (see .env.local.example).`,
    );
  }
  return value;
}

const people = {} as Record<Label, Person>;
let admin: Client;
let visitor: Client;

/** Deletes test shops and logins whose names start with `prefix`. */
async function removeTestData(prefix: string) {
  // Deleting a shop also deletes its subscription and memberships (cascade).
  const shops = await admin.from("tenants").delete().like("slug", `${prefix}%`);
  if (shops.error) {
    throw new Error(`Could not delete test shops: ${shops.error.message}`);
  }

  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (error) throw new Error(`Could not list logins: ${error.message}`);
  for (const user of data.users) {
    if (user.email?.startsWith(prefix) && user.email.endsWith("@example.com")) {
      const removed = await admin.auth.admin.deleteUser(user.id);
      if (removed.error) {
        throw new Error(
          `Could not delete test login: ${removed.error.message}`,
        );
      }
    }
  }
}

async function createPerson(
  label: Label,
  planId: string,
  url: string,
  publishableKey: string,
): Promise<Person> {
  const name = `${RUN}${label.toLowerCase()}`;
  const email = `${name}@example.com`;
  const password = randomBytes(24).toString("base64url");

  const user = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (user.error) throw new Error(`Login ${label}: ${user.error.message}`);

  const tenant = await admin
    .from("tenants")
    .insert({ slug: name, name: `RLS test shop ${label}` })
    .select("id")
    .single();
  if (tenant.error) throw new Error(`Shop ${label}: ${tenant.error.message}`);

  const subscription = await admin
    .from("subscriptions")
    .insert({
      tenant_id: tenant.data.id,
      plan_id: planId,
      status: "trialing",
      trial_ends_at: new Date(Date.now() + 15 * 86_400_000).toISOString(),
    })
    .select("id")
    .single();
  if (subscription.error) {
    throw new Error(`Subscription ${label}: ${subscription.error.message}`);
  }

  const membership = await admin
    .from("memberships")
    .insert({
      tenant_id: tenant.data.id,
      user_id: user.data.user.id,
      role: "merchant_admin",
    })
    .select("id")
    .single();
  if (membership.error) {
    throw new Error(`Membership ${label}: ${membership.error.message}`);
  }

  const db = createClient<Database>(url, publishableKey, noSession);
  const signIn = await db.auth.signInWithPassword({ email, password });
  if (signIn.error) throw new Error(`Log in ${label}: ${signIn.error.message}`);

  return {
    userId: user.data.user.id,
    tenantId: tenant.data.id,
    subscriptionId: subscription.data.id,
    membershipId: membership.data.id,
    db,
  };
}

beforeAll(async () => {
  const url = setting("NEXT_PUBLIC_SUPABASE_URL");
  const publishableKey = setting("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  const secretKey = setting("SUPABASE_SECRET_KEY");

  admin = createClient<Database>(url, secretKey, noSession);
  visitor = createClient<Database>(url, publishableKey, noSession);

  // Leftovers from an earlier run that stopped before cleaning up.
  await removeTestData(PREFIX);

  const plan = await admin
    .from("plans")
    .select("id")
    .eq("code", "starter")
    .single();
  if (plan.error) throw new Error(`Plan: ${plan.error.message}`);

  people.A = await createPerson("A", plan.data.id, url, publishableKey);
  people.B = await createPerson("B", plan.data.id, url, publishableKey);
});

afterAll(async () => {
  if (!admin) return;
  for (const person of Object.values(people)) {
    await person.db.auth.signOut({ scope: "local" });
  }
  await removeTestData(RUN);
});

const pairs: [Label, Label][] = [
  ["A", "B"],
  ["B", "A"],
];

describe.each(pairs)("a merchant admin of shop %s", (me, other) => {
  it("can read its own shop, subscription and membership", async () => {
    const self = people[me];

    const tenants = await self.db
      .from("tenants")
      .select("id")
      .eq("id", self.tenantId);
    expect(tenants.error).toBeNull();
    expect(tenants.data).toHaveLength(1);

    const subscriptions = await self.db
      .from("subscriptions")
      .select("id")
      .eq("tenant_id", self.tenantId);
    expect(subscriptions.error).toBeNull();
    expect(subscriptions.data?.map((row) => row.id)).toEqual([
      self.subscriptionId,
    ]);

    const memberships = await self.db
      .from("memberships")
      .select("id")
      .eq("tenant_id", self.tenantId);
    expect(memberships.error).toBeNull();
    expect(memberships.data?.map((row) => row.id)).toContain(self.membershipId);
  });

  it(`cannot read shop ${other}'s tenants row`, async () => {
    const self = people[me];
    const them = people[other];

    // The row exists: the secret key, which bypasses RLS, can see it.
    const exists = await admin
      .from("tenants")
      .select("id")
      .eq("id", them.tenantId);
    expect(exists.data).toHaveLength(1);

    const byId = await self.db
      .from("tenants")
      .select("id")
      .eq("id", them.tenantId);
    expect(byId.error).toBeNull();
    expect(byId.data).toEqual([]);

    const all = await self.db.from("tenants").select("id");
    expect(all.error).toBeNull();
    expect(all.data?.map((row) => row.id)).not.toContain(them.tenantId);
  });

  it(`cannot read shop ${other}'s subscriptions row`, async () => {
    const self = people[me];
    const them = people[other];

    // The row exists: the secret key, which bypasses RLS, can see it.
    const exists = await admin
      .from("subscriptions")
      .select("id")
      .eq("tenant_id", them.tenantId);
    expect(exists.data).toHaveLength(1);

    const byShop = await self.db
      .from("subscriptions")
      .select("id")
      .eq("tenant_id", them.tenantId);
    expect(byShop.error).toBeNull();
    expect(byShop.data).toEqual([]);

    const all = await self.db.from("subscriptions").select("id");
    expect(all.error).toBeNull();
    expect(all.data?.map((row) => row.id)).not.toContain(them.subscriptionId);
  });

  it(`cannot read shop ${other}'s memberships rows`, async () => {
    const self = people[me];
    const them = people[other];

    // The row exists: the secret key, which bypasses RLS, can see it.
    const exists = await admin
      .from("memberships")
      .select("id")
      .eq("tenant_id", them.tenantId);
    expect(exists.data?.map((row) => row.id)).toContain(them.membershipId);

    const byShop = await self.db
      .from("memberships")
      .select("id")
      .eq("tenant_id", them.tenantId);
    expect(byShop.error).toBeNull();
    expect(byShop.data).toEqual([]);

    const byPerson = await self.db
      .from("memberships")
      .select("id")
      .eq("user_id", them.userId);
    expect(byPerson.error).toBeNull();
    expect(byPerson.data).toEqual([]);

    const all = await self.db.from("memberships").select("id");
    expect(all.error).toBeNull();
    expect(all.data?.map((row) => row.id)).not.toContain(them.membershipId);
  });

  it(`cannot rename shop ${other} or join it`, async () => {
    const self = people[me];
    const them = people[other];

    const rename = await self.db
      .from("tenants")
      .update({ name: "changed by another shop" })
      .eq("id", them.tenantId)
      .select("id");
    expect(rename.error).toBeNull();
    expect(rename.data).toEqual([]);

    const unchanged = await admin
      .from("tenants")
      .select("name")
      .eq("id", them.tenantId)
      .single();
    expect(unchanged.data?.name).toBe(`RLS test shop ${other}`);

    const join = await self.db.from("memberships").insert({
      tenant_id: them.tenantId,
      user_id: self.userId,
      role: "merchant_admin",
    });
    expect(join.error?.code).toBe("42501");
  });
});

describe("a visitor who is not logged in", () => {
  it("sees no tenants, subscriptions or memberships rows", async () => {
    for (const table of ["tenants", "subscriptions", "memberships"] as const) {
      const { data } = await visitor.from(table).select("id");
      // Either "permission denied" (no data) or zero rows: nothing leaks.
      expect(data ?? []).toEqual([]);
    }
  });
});
