import type { Metadata } from "next";
import Link from "next/link";

import { Bi } from "@/components/bi";
import { Sheet, SheetSection } from "@/components/sheet";
import { SignOutButton } from "@/components/sign-out-button";
import { buttonClass } from "@/components/ui";
import { safeNextPath } from "@/lib/auth/paths";
import { getViewer, homePathFor } from "@/lib/auth/viewer";
import { APP_NAME } from "@/lib/brand";
import { siteUrl } from "@/lib/hosts";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage(props: PageProps<"/login">) {
  const { next } = await props.searchParams;
  const nextPath = safeNextPath(Array.isArray(next) ? next[0] : next);
  const viewer = await getViewer();

  return (
    <main className="mx-auto w-full max-w-md px-4 py-6 sm:py-10">
      <Sheet>
        <SheetSection
          as="header"
          className="border-b-4 border-double border-rule-strong"
        >
          <a href={siteUrl("/")} className="text-sm text-ink-muted underline">
            {APP_NAME}
          </a>
          <h1 className="text-2xl font-bold">
            <Bi hi="लॉग इन" en="Log in" />
          </h1>
        </SheetSection>

        {viewer ? (
          // Someone is already logged in on this device. Say who, instead of
          // silently skipping the form, so a shared phone can switch people.
          <SheetSection className="space-y-4">
            <div>
              <p className="text-ink-muted">
                <Bi
                  hi="इस फ़ोन पर पहले से लॉग इन हैं:"
                  en="Already logged in on this device as:"
                  layout="stack"
                />
              </p>
              <p className="mt-1 text-lg font-semibold break-all">
                {viewer.email}
              </p>
            </div>
            <Link
              href={nextPath ?? homePathFor(viewer)}
              className={buttonClass("primary", "w-full")}
            >
              <Bi hi="आगे बढ़ें" en="Continue" />
            </Link>
            <SignOutButton
              next={nextPath ?? undefined}
              label={{
                hi: "दूसरे खाते से लॉग इन करें",
                en: "Use another account",
              }}
              className="w-full"
            />
          </SheetSection>
        ) : (
          <>
            <SheetSection>
              <LoginForm next={nextPath} />
            </SheetSection>
            <SheetSection as="footer" className="border-t border-rule text-sm">
              <p className="text-ink-muted">
                <Bi
                  hi="खाते हमारी टीम बनाती है। पासवर्ड भूल गए तो हमसे संपर्क करें।"
                  en="Accounts are created by our team. Forgot your password? Contact us."
                  layout="stack"
                />
              </p>
            </SheetSection>
          </>
        )}
      </Sheet>
    </main>
  );
}
