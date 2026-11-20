import type { Metadata } from "next";
import Link from "next/link";

import { Bi } from "@/components/bi";
import { Sheet, SheetSection } from "@/components/sheet";
import { SignOutButton } from "@/components/sign-out-button";
import { Notice } from "@/components/ui";
import { roleLabels } from "@/lib/auth/roles";
import { requireViewer } from "@/lib/auth/viewer";
import { APP_NAME } from "@/lib/brand";
import { siteUrl } from "@/lib/hosts";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage(props: PageProps<"/account">) {
  const viewer = await requireViewer("/account");
  const { denied } = await props.searchParams;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10">
      <Sheet>
        <SheetSection
          as="header"
          className="flex flex-wrap items-start justify-between gap-3 border-b-4 border-double border-rule-strong"
        >
          <div>
            <a href={siteUrl("/")} className="text-sm text-ink-muted underline">
              {APP_NAME}
            </a>
            <h1 className="text-2xl font-bold">
              <Bi hi="मेरा खाता" en="My account" />
            </h1>
            <p className="break-all text-ink-muted">{viewer.email}</p>
          </div>
          <SignOutButton />
        </SheetSection>

        {denied === "admin" && (
          <SheetSection className="border-b border-rule">
            <Notice>
              <Bi
                hi="सुपर एडमिन वाला हिस्सा सिर्फ़ प्लेटफ़ॉर्म टीम के लिए है।"
                en="The super admin area is only for the platform team."
                layout="stack"
              />
            </Notice>
          </SheetSection>
        )}

        <SheetSection>
          <h2 className="mb-2 text-lg font-bold">
            <Bi hi="मेरी भूमिकाएँ" en="My roles" />
          </h2>

          {viewer.isPlatformAdmin && (
            <p className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-rule pb-2">
              <span className="font-semibold">
                <Bi
                  hi={roleLabels.super_admin.hi}
                  en={roleLabels.super_admin.en}
                />
              </span>
              <Link
                href="/admin"
                className="inline-flex min-h-12 items-center font-semibold text-action underline"
              >
                <Bi hi="एडमिन खोलें" en="Open admin" />
              </Link>
            </p>
          )}

          {viewer.memberships.length > 0 ? (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-rule-strong text-sm">
                  <th scope="col" className="py-2 pr-2 font-semibold">
                    <Bi hi="दुकान" en="Shop" layout="stack" />
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    <Bi hi="भूमिका" en="Role" layout="stack" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {viewer.memberships.map((m) => (
                  <tr key={m.tenantId} className="border-b border-rule">
                    <td className="py-2 pr-2">
                      <span className="font-semibold">{m.tenantName}</span>
                      <span className="block text-sm text-ink-muted">
                        {m.tenantSlug}
                        {!m.tenantActive && " · बंद / paused"}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <Bi
                        hi={roleLabels[m.role].hi}
                        en={roleLabels[m.role].en}
                        layout="stack"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            !viewer.isPlatformAdmin && (
              <p className="text-ink-muted">
                <Bi
                  hi="आप अभी किसी दुकान से नहीं जुड़े हैं।"
                  en="You are not linked to any shop yet."
                  layout="stack"
                />
              </p>
            )
          )}

          {viewer.memberships.length > 0 && (
            <p className="mt-3 text-sm text-ink-muted">
              <Bi
                hi="दुकान, डिलीवरी और ग्राहक की स्क्रीन अगले चरण (M1) में आएँगी।"
                en="Shop, delivery and customer screens come in the next milestone (M1)."
                layout="stack"
              />
            </p>
          )}
        </SheetSection>
      </Sheet>
    </main>
  );
}
