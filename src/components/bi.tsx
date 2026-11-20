type BiProps = {
  hi: string;
  en: string;
  /** "line" puts both on one line; "stack" puts English under Hindi. */
  layout?: "line" | "stack";
};

/**
 * A Hindi + English label. Hindi comes first; English is a little smaller.
 * Use it for every heading, button and field label.
 * "stack" follows the parent's text alignment, so it works in right-aligned
 * table cells too.
 */
export function Bi({ hi, en, layout = "line" }: BiProps) {
  if (layout === "stack") {
    return (
      <span className="inline-block leading-tight">
        <span lang="hi" className="block">
          {hi}
        </span>
        <span lang="en" className="block text-[0.8em] font-normal opacity-80">
          {en}
        </span>
      </span>
    );
  }

  return (
    <span>
      <span lang="hi">{hi}</span>
      <span aria-hidden="true" className="px-1.5 opacity-50">
        /
      </span>
      <span lang="en" className="text-[0.85em] font-normal opacity-80">
        {en}
      </span>
    </span>
  );
}
