import Link from "next/link";

import { Bi } from "@/components/bi";
import { Sheet, SheetSection } from "@/components/sheet";
import { buttonClass } from "@/components/ui";
import { requirePlatformAdmin } from "@/lib/auth/viewer";
import { daysUntil, formatDateIST } from "@/lib/dates";
import {
  statusLabels,
  statusTone,
  type SubscriptionStatus,
} from "@/lib/subscriptions";
import { createClient } from "@/lib/supabase/server";

// One grid for the header and every row, so columns line up on wide screens.
// On a phone each row stacks: name and status, then plan, then trial end.
const rowGrid =
  "grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)] sm:items-center";

function TrialEnd({
  trialEndsAt,
  status,
  now,
}: {
  trialEndsAt: string | null;
  status: SubscriptionStatus | null;
  now: number;
}) {
  if (!trialEndsAt) return <span className="text-ink-muted">—</span>;
  const days = daysUntil(trialEndsAt, now);
  return (
    <span>
      <span className="tabular-nums">{formatDateIST(trialEndsAt)}</span>
      {status === "trialing" && (
        <span
          className={`block text-sm ${days < 0 ? "text-margin" : "text-ink-muted"}`}
        >
          {days < 0 ? (
            <Bi hi="ख़त्म हो गया" en="ended" />
          ) : (
            <Bi hi={`${days} दिन बाकी`} en={`${days} days left`} />
          )}
        </span>
      )}
    </span>
  );
}

/** Every shop with its subscription and plan, newest first. */
async function loadShops() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tenants")
    .select(
      "id, slug, name, created_at, subscription:subscriptions(status, trial_ends_at, plan:plans(name))",
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Could not load shops: ${error.message}`);
  // "Days left" is counted from the moment the list was read.
  return { shops: data, now: Date.now() };
}

export default async function AdminShopsPage() {
  await requirePlatformAdmin();
  const { shops, now } = await loadShops();

  return (
    <Sheet>
      <SheetSection
        as="header"
        className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-double border-rule-strong"
      >
        <h1 className="text-2xl font-bold">
          <Bi hi="दुकानें" en="Shops" />{" "}
          <span className="text-lg font-normal text-ink-muted tabular-nums">
            ({shops.length})
          </span>
        </h1>
        <Link href="/admin/shops/new" className={buttonClass("primary")}>
          <Bi hi="+ नई दुकान" en="New shop" />
        </Link>
      </SheetSection>

      {shops.length === 0 ? (
        <SheetSection>
          <p className="text-ink-muted">
            <Bi
              hi="अभी कोई दुकान नहीं है। ऊपर “नई दुकान” से पहली दुकान बनाएँ।"
              en="No shops yet. Create the first one with “New shop” above."
              layout="stack"
            />
          </p>
        </SheetSection>
      ) : (
        <div>
          <div
            className={`hidden border-b-2 border-rule-strong py-2 pr-4 pl-9 text-sm font-semibold sm:grid sm:pl-14 ${rowGrid}`}
          >
            <Bi hi="दुकान" en="Shop" layout="stack" />
            <Bi hi="प्लान" en="Plan" layout="stack" />
            <Bi hi="स्थिति" en="Status" layout="stack" />
            <Bi hi="ट्रायल ख़त्म" en="Trial ends" layout="stack" />
          </div>
          <ul>
            {shops.map((shop) => {
              const sub = shop.subscription;
              const status = sub?.status ?? null;
              return (
                <li key={shop.id} className="border-b border-rule">
                  <Link
                    href={`/admin/shops/${shop.id}`}
                    className={`min-h-12 py-3 pr-4 pl-9 hover:bg-paper sm:pl-14 ${rowGrid}`}
                  >
                    <span className="min-w-0">
                      <span className="block font-semibold break-words text-action underline">
                        {shop.name}
                      </span>
                      <span className="block text-sm break-all text-ink-muted">
                        {shop.slug}
                      </span>
                    </span>

                    <span
                      className={`text-right font-semibold sm:order-3 sm:text-left ${status ? statusTone[status] : "text-margin"}`}
                    >
                      {status ? (
                        <Bi
                          hi={statusLabels[status].hi}
                          en={statusLabels[status].en}
                          layout="stack"
                        />
                      ) : (
                        <Bi
                          hi="सब्सक्रिप्शन नहीं"
                          en="No subscription"
                          layout="stack"
                        />
                      )}
                    </span>

                    <span className="col-span-2 sm:order-2 sm:col-span-1">
                      <span className="text-sm text-ink-muted sm:hidden">
                        <Bi hi="प्लान" en="Plan" />:{" "}
                      </span>
                      {sub?.plan?.name ?? "—"}
                    </span>

                    <span className="col-span-2 sm:order-4 sm:col-span-1">
                      <span className="text-sm text-ink-muted sm:hidden">
                        <Bi hi="ट्रायल ख़त्म" en="Trial ends" />:{" "}
                      </span>
                      <TrialEnd
                        trialEndsAt={sub?.trial_ends_at ?? null}
                        status={status}
                        now={now}
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Sheet>
  );
}
