import type { Metadata, Viewport } from "next";

import { APP_NAME } from "@/lib/brand";

import "./globals.css";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description:
    "Standing orders, packing lists, delivery and credit ledger for daily-supply wholesalers.",
};

export const viewport: Viewport = {
  themeColor: "#f6f2e8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
