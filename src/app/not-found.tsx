import { Bi } from "@/components/bi";
import { Sheet, SheetSection } from "@/components/sheet";
import { buttonClass } from "@/components/ui";
import { siteUrl } from "@/lib/hosts";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-6 sm:py-10">
      <Sheet>
        <SheetSection
          as="header"
          className="border-b-4 border-double border-rule-strong"
        >
          <h1 className="text-xl font-bold">
            <Bi hi="यह पन्ना नहीं मिला" en="Page not found" />
          </h1>
        </SheetSection>
        <SheetSection className="space-y-4">
          <p className="text-ink-muted">
            <Bi
              hi="पता दोबारा जाँचें।"
              en="Check the address and try again."
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
