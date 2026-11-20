import type { Metadata } from "next";
import Link from "next/link";

import { Bi } from "@/components/bi";
import { SignOutButton } from "@/components/sign-out-button";
import { requirePlatformAdmin } from "@/lib/auth/viewer";
import { APP_NAME } from "@/lib/brand";
import { siteUrl } from "@/lib/hosts";

export const metadata: Metadata = {
  title: { default: "Super admin", template: `%s · Super admin · ${APP_NAME}` },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  // Guard for the whole area. Each page and action checks again, because a
  // layout is not re-run on every navigation.
  const viewer = await requirePlatformAdmin();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:py-6">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b-4 border-double border-rule-strong pb-3">
        <div>
          <a href={siteUrl("/")} className="text-sm text-ink-muted underline">
            {APP_NAME}
          </a>
          <Link href="/admin" className="block text-xl font-bold">
            <Bi hi="सुपर एडमिन" en="Super admin" />
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/account"
            className="inline-flex min-h-12 items-center text-sm break-all text-ink-muted underline"
          >
            {viewer.email}
          </Link>
          <SignOutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
