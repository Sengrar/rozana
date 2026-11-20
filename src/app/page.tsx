import { Bi } from "@/components/bi";
import { Sheet, SheetSection } from "@/components/sheet";
import { buttonClass } from "@/components/ui";
import { APP_NAME } from "@/lib/brand";
import { appUrl } from "@/lib/hosts";

import { SystemCheck } from "./_components/system-check";

export default function HomePage() {
  const showSystemCheck = process.env.NODE_ENV === "development";

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10">
      <Sheet>
        <SheetSection
          as="header"
          className="flex flex-wrap items-start justify-between gap-3 border-b-4 border-double border-rule-strong"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{APP_NAME}</h1>
            <p className="text-ink-muted">
              <Bi
                hi="रोज़ की सप्लाई वाले थोक व्यापारियों के लिए"
                en="For daily-supply wholesalers"
              />
            </p>
          </div>
          <a href={appUrl("/login")} className={buttonClass("primary")}>
            <Bi hi="लॉग इन" en="Log in" />
          </a>
        </SheetSection>

        <SheetSection className="space-y-1 border-b border-rule">
          <p lang="hi">
            रोज़ के फिक्स ऑर्डर, सुबह की पैकिंग लिस्ट, डिलीवरी और उधार खाता, सब
            एक जगह।
          </p>
          <p lang="en" className="text-ink-muted">
            Standing orders, the morning packing list, delivery and the credit
            ledger, in one place.
          </p>
        </SheetSection>

        {showSystemCheck && <SystemCheck />}
      </Sheet>
    </main>
  );
}
