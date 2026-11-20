import { Bi } from "@/components/bi";
import { Sheet, SheetSection } from "@/components/sheet";
import { buttonClass } from "@/components/ui";
import { siteUrl } from "@/lib/hosts";

/** Shown for a shop address that does not exist or is switched off. */
export default function ShopNotFound() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-6 sm:py-10">
      <Sheet>
        <SheetSection
          as="header"
          className="border-b-4 border-double border-rule-strong"
        >
          <h1 className="text-xl font-bold">
            <Bi hi="यह दुकान नहीं मिली" en="Shop not found" />
          </h1>
        </SheetSection>
        <SheetSection className="space-y-4">
          <p className="text-ink-muted">
            <Bi
              hi="पता जाँचें, या दुकान से उसका सही लिंक माँगें।"
              en="Check the address, or ask the shop for its correct link."
              layout="stack"
            />
          </p>
          <a href={siteUrl("/")} className={buttonClass("secondary")}>
            <Bi hi="होम पेज" en="Home page" />
          </a>
        </SheetSection>
      </Sheet>
    </main>
  );
}
