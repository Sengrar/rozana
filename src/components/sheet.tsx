import type { ReactNode } from "react";

type SheetProps = {
  children: ReactNode;
  className?: string;
};

/**
 * One page of the bill book: a paper sheet with a red double margin line
 * down the left side. Put SheetSection blocks inside it.
 */
export function Sheet({ children, className = "" }: SheetProps) {
  return (
    <article
      className={`relative border border-rule-strong bg-sheet ${className}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-5 w-px bg-margin sm:left-9"
      />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-6 w-px bg-margin sm:left-10"
      />
      {children}
    </article>
  );
}

type SheetSectionProps = SheetProps & {
  as?: "section" | "header" | "footer" | "div";
};

/** A block of content inside a Sheet, kept clear of the margin line. */
export function SheetSection({
  children,
  className = "",
  as: Tag = "section",
}: SheetSectionProps) {
  return (
    <Tag className={`py-4 pr-4 pl-9 sm:pl-14 ${className}`}>{children}</Tag>
  );
}
