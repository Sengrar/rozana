"use client";

import { Bi } from "@/components/bi";
import { Sheet, SheetSection } from "@/components/sheet";
import { Button } from "@/components/ui";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-6 sm:py-10">
      <Sheet>
        <SheetSection
          as="header"
          className="border-b-4 border-double border-rule-strong"
        >
          <h1 className="text-xl font-bold text-margin">
            <Bi hi="कुछ गड़बड़ हो गई" en="Something went wrong" />
          </h1>
        </SheetSection>
        <SheetSection className="space-y-3">
          <p className="text-ink-muted">
            <Bi
              hi="दोबारा कोशिश करें। बार-बार हो तो हमें यह कोड बताएँ:"
              en="Please try again. If it keeps happening, send us this code:"
              layout="stack"
            />
          </p>
          <p className="font-mono text-sm">{error.digest ?? "—"}</p>
          <Button type="button" onClick={reset}>
            <Bi hi="दोबारा कोशिश करें" en="Try again" />
          </Button>
        </SheetSection>
      </Sheet>
    </main>
  );
}
