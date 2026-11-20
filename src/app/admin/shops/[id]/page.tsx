import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Bi } from "@/components/bi";
import { Sheet, SheetSection } from "@/components/sheet";
import { Notice } from "@/components/ui";
import { roleLabels } from "@/lib/auth/roles";
import { requirePlatformAdmin } from "@/lib/auth/viewer";
import { formatDateIST, toDateInputIST } from "@/lib/dates";
import { shopUrl } from "@/lib/hosts";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";

import { removeMember } from "../../actions";

import { AddMemberForm } from "./add-member-form";
import { SubscriptionForm } from "./subscription-form";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage(props: PageProps<"/admin/shops/[id]">) {
  const { id } = await props.params;
  await requirePlatformAdmin(`/admin/shops/${id}`);
  if (!isUuid(id)) notFound();

  const { created } = await props.searchParams;
  const supabase = await createClient();

  const [shopResult, plansResult, membersResult] = await Promise.all([
    supabase
      .from("tenants")
      .select(
        "id, slug, name, created_at, subscription:subscriptions(plan_id, status, trial_ends_at)",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("plans")
      .select("id, name, price_month_paise")
      .order("sort_order"),
    supabase.rpc("admin_list_members", { p_tenant: id }),
  ]);

  if (shopResult.error) {
    throw new Error(`Could not load shop: ${shopResult.error.message}`);
  }
  if (!shopResult.data) notFound();
  if (plansResult.error) {
    throw new Error(`Could not load plans: ${plansResult.error.message}`);
  }

  // PGRST202: the 0002 migration has not been run on this database yet.
  const membersMissing = membersResult.error?.code === "PGRST202";
  if (membersResult.error && !membersMissing) {
    throw new Error(`Could not load people: ${membersResult.error.message}`);
  }

  const shop = shopResult.data;
  const sub = shop.subscription;
  const members = membersResult.data ?? [];

  return (
    <div className="space-y-3">
      <Link
        href="/admin"
        className="inline-flex min-h-12 items-center underline"
      >
        <Bi hi="← दुकानें" en="Shops" />
      </Link>

      <Sheet>
        <SheetSection
          as="header"
          className="border-b-4 border-double border-rule-strong"
        >
          <h1 className="text-2xl font-bold break-words">{shop.name}</h1>
          <p className="text-ink-muted">
            <Bi hi="बनी" en="created" /> {formatDateIST(shop.created_at)}
          </p>
          <p className="mt-2">
            <span className="text-sm text-ink-muted">
              <Bi hi="दुकान का पता" en="Shop address" />:{" "}
            </span>
            <a
              href={shopUrl(shop.slug)}
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-12 items-center font-semibold break-all text-action underline"
            >
              {shopUrl(shop.slug).replace(/^https?:\/\//, "")}
            </a>
          </p>
        </SheetSection>

        {created === "1" && (
          <SheetSection className="border-b border-rule">
            <Notice tone="ok">
              <Bi
                hi="दुकान बन गई और ट्रायल शुरू हो गया।"
                en="Shop created and its trial has started."
                layout="stack"
              />
            </Notice>
          </SheetSection>
        )}

        <SheetSection className="border-b border-rule">
          <h2 className="mb-3 text-lg font-bold">
            <Bi hi="प्लान और ट्रायल" en="Plan and trial" />
          </h2>
          {sub ? (
            <SubscriptionForm
              tenantId={shop.id}
              plans={plansResult.data}
              current={{
                planId: sub.plan_id,
                status: sub.status,
                trialEnd: sub.trial_ends_at
                  ? toDateInputIST(sub.trial_ends_at)
                  : "",
              }}
            />
          ) : (
            <Notice>
              <Bi
                hi="इस दुकान का सब्सक्रिप्शन नहीं मिला।"
                en="This shop has no subscription row."
                layout="stack"
              />
            </Notice>
          )}
        </SheetSection>

        <SheetSection>
          <h2 className="mb-3 text-lg font-bold">
            <Bi hi="लोग" en="People" />
          </h2>

          {membersMissing ? (
            <Notice>
              <Bi
                hi="डेटाबेस अपडेट बाकी है: Supabase के SQL Editor में supabase/migrations/0002_admin_members.sql चलाएँ।"
                en="Database update missing: run supabase/migrations/0002_admin_members.sql in Supabase's SQL Editor."
                layout="stack"
              />
            </Notice>
          ) : (
            <>
              {members.length === 0 ? (
                <p className="mb-4 text-ink-muted">
                  <Bi
                    hi="अभी इस दुकान में कोई नहीं जुड़ा है।"
                    en="Nobody is linked to this shop yet."
                    layout="stack"
                  />
                </p>
              ) : (
                <ul className="mb-5 border-t-2 border-rule-strong">
                  {members.map((member) => (
                    <li
                      key={member.membership_id}
                      className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-rule py-2"
                    >
                      <span className="min-w-0">
                        <span className="block font-semibold break-all">
                          {member.email}
                        </span>
                        <span className="block text-sm text-ink-muted">
                          <Bi
                            hi={roleLabels[member.role].hi}
                            en={roleLabels[member.role].en}
                          />
                          {!member.is_active && " · बंद / inactive"}
                        </span>
                      </span>
                      <form action={removeMember}>
                        <input type="hidden" name="tenant_id" value={shop.id} />
                        <input
                          type="hidden"
                          name="membership_id"
                          value={member.membership_id}
                        />
                        <button
                          type="submit"
                          className="inline-flex min-h-12 items-center px-2 text-margin underline"
                        >
                          <Bi hi="हटाएँ" en="Remove" />
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
              <h3 className="mb-2 font-bold">
                <Bi hi="व्यक्ति जोड़ें" en="Add a person" />
              </h3>
              <AddMemberForm tenantId={shop.id} />
            </>
          )}
        </SheetSection>
      </Sheet>
    </div>
  );
}
