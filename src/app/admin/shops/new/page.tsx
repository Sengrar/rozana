import type { Metadata } from "next";
import Link from "next/link";

import { Bi } from "@/components/bi";
import { Sheet, SheetSection } from "@/components/sheet";
import { requirePlatformAdmin } from "@/lib/auth/viewer";
import { createClient } from "@/lib/supabase/server";

import { CreateShopForm } from "./create-shop-form";

export const metadata: Metadata = { title: "New shop" };

export default async function NewShopPage() {
  await requirePlatformAdmin("/admin/shops/new");

  const supabase = await createClient();
  const { data: plans, error } = await supabase
    .from("plans")
    .select("code, name, price_month_paise")
    .order("sort_order");
  if (error) throw new Error(`Could not load plans: ${error.message}`);

  return (
    <div className="space-y-3">
      <Link
        href="/admin"
        className="inline-flex min-h-12 items-center underline"
      >
        <Bi hi="← दुकानें" en="Shops" />
      </Link>
      <Sheet className="max-w-xl">
        <SheetSection
          as="header"
          className="border-b-4 border-double border-rule-strong"
        >
          <h1 className="text-2xl font-bold">
            <Bi hi="नई दुकान" en="New shop" />
          </h1>
          <p className="text-sm text-ink-muted">
            <Bi
              hi="दुकान बनते ही उसका ट्रायल शुरू हो जाता है।"
              en="The trial starts as soon as the shop is created."
              layout="stack"
            />
          </p>
        </SheetSection>
        <SheetSection>
          <CreateShopForm plans={plans} />
        </SheetSection>
      </Sheet>
    </div>
  );
}
