import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Bi } from "@/components/bi";
import { Sheet, SheetSection } from "@/components/sheet";
import { APP_NAME } from "@/lib/brand";
import { siteUrl } from "@/lib/hosts";
import { getShopBySlug } from "@/lib/shops";

// Reached through <shop>.<domain>; the middleware rewrites it to /shop/<shop>.

export async function generateMetadata(
  props: PageProps<"/shop/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const shop = await getShopBySlug(slug);
  return { title: shop ? { absolute: shop.name } : "Shop not found" };
}

export default async function ShopHomePage(props: PageProps<"/shop/[slug]">) {
  const { slug } = await props.params;
  const shop = await getShopBySlug(slug);
  if (!shop) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10">
      <Sheet>
        <SheetSection
          as="header"
          className="border-b-4 border-double border-rule-strong"
        >
          <h1 className="text-3xl font-bold break-words">{shop.name}</h1>
        </SheetSection>

        <SheetSection className="border-b border-rule">
          <p className="text-lg">
            <Bi
              hi="इस दुकान से ऑनलाइन ऑर्डर जल्द शुरू होंगे।"
              en="Online ordering from this shop starts soon."
              layout="stack"
            />
          </p>
        </SheetSection>

        <SheetSection as="footer" className="text-sm text-ink-muted">
          Powered by{" "}
          <a href={siteUrl("/")} className="underline">
            {APP_NAME}
          </a>
        </SheetSection>
      </Sheet>
    </main>
  );
}
