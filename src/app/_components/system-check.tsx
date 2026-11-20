import type { ReactNode } from "react";

import { Bi } from "@/components/bi";
import { SheetSection } from "@/components/sheet";
import { formatPaise } from "@/lib/money";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type PlanRow = {
  code: string;
  name: string;
  price_month_paise: number;
  price_year_paise: number;
};

type PlansResult =
  { ok: true; plans: PlanRow[] } | { ok: false; error: string };

/** Reads the public plans table through the server helper, as a visitor. */
async function loadPlans(): Promise<PlansResult> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("plans")
      .select("code, name, price_month_paise, price_year_paise")
      .order("sort_order");
    if (error) return { ok: false, error: error.message };
    return { ok: true, plans: (data ?? []) as PlanRow[] };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

type Tone = "ok" | "bad" | "muted";

const toneClass: Record<Tone, string> = {
  ok: "font-semibold text-ok",
  bad: "font-semibold text-margin",
  muted: "text-ink-muted",
};

function CheckRow({
  label,
  tone,
  value,
}: {
  label: ReactNode;
  tone: Tone;
  value: ReactNode;
}) {
  return (
    <tr className="border-b border-rule">
      <th scope="row" className="py-2 pr-3 align-top font-normal">
        {label}
      </th>
      <td className={`py-2 text-right align-top ${toneClass[tone]}`}>
        {value}
      </td>
    </tr>
  );
}

const OK = <Bi hi="ठीक" en="OK" layout="stack" />;
const MISSING = <Bi hi="नहीं मिला" en="Missing" layout="stack" />;

/**
 * Development-only panel. Shows whether the app can reach Supabase and read
 * the plans table (which visitors are allowed to read).
 */
export async function SystemCheck() {
  const urlSet = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const keySet = Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const result = hasSupabaseEnv() ? await loadPlans() : null;

  return (
    <SheetSection>
      <h2 className="text-lg font-bold">
        <Bi hi="सिस्टम जाँच" en="System check" />
      </h2>
      <p className="mb-3 text-sm text-ink-muted">
        <Bi
          hi="यह हिस्सा सिर्फ़ डेवलपमेंट में दिखता है"
          en="Shown only in development"
        />
      </p>

      <table className="w-full border-collapse text-left">
        <tbody>
          <CheckRow
            label={<Bi hi="Supabase पता" en="Supabase URL" layout="stack" />}
            tone={urlSet ? "ok" : "bad"}
            value={urlSet ? OK : MISSING}
          />
          <CheckRow
            label={<Bi hi="पब्लिशेबल की" en="Publishable key" layout="stack" />}
            tone={keySet ? "ok" : "bad"}
            value={keySet ? OK : MISSING}
          />
          <CheckRow
            label={<Bi hi="डेटाबेस" en="Database" layout="stack" />}
            tone={result === null ? "muted" : result.ok ? "ok" : "bad"}
            value={
              result === null ? (
                <Bi hi="जाँच नहीं हुई" en="Not checked" layout="stack" />
              ) : result.ok ? (
                <Bi hi="जुड़ा हुआ" en="Connected" layout="stack" />
              ) : (
                <Bi hi="नहीं जुड़ा" en="Not connected" layout="stack" />
              )
            }
          />
        </tbody>
      </table>

      {result === null && (
        <p className="mt-3 text-sm text-ink-muted">
          Copy <code>.env.local.example</code> to <code>.env.local</code> and
          fill in the Supabase values, then restart <code>npm run dev</code>.
        </p>
      )}

      {result?.ok === false && (
        <p className="mt-3 text-sm break-words text-margin">{result.error}</p>
      )}

      {result?.ok === true && (
        <>
          <h3 className="mt-5 font-bold">
            <Bi hi="प्लान" en="Plans" />
          </h3>
          <table className="mt-1 w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-rule-strong text-sm">
                <th scope="col" className="py-2 pr-2 font-semibold">
                  <Bi hi="नाम" en="Name" layout="stack" />
                </th>
                <th scope="col" className="py-2 pr-2 text-right font-semibold">
                  <Bi hi="महीना" en="Month" layout="stack" />
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  <Bi hi="साल" en="Year" layout="stack" />
                </th>
              </tr>
            </thead>
            <tbody>
              {result.plans.map((plan) => (
                <tr key={plan.code} className="border-b border-rule">
                  <td className="py-2 pr-2">{plan.name}</td>
                  <td className="py-2 pr-2 text-right tabular-nums">
                    {formatPaise(plan.price_month_paise)}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {formatPaise(plan.price_year_paise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </SheetSection>
  );
}
