/**
 * Money is stored as whole paise (AGENTS.md hard rule). These helpers are for
 * display only; never do arithmetic on the formatted strings.
 */
const rupeeGrouping = new Intl.NumberFormat("en-IN");

/** 49900 -> "₹499", 12345678 -> "₹1,23,456.78", -500 -> "-₹5" */
export function formatPaise(paise: number): string {
  if (!Number.isSafeInteger(paise)) {
    throw new Error(`Amount must be a whole number of paise, got ${paise}`);
  }
  const sign = paise < 0 ? "-" : "";
  const abs = Math.abs(paise);
  const rupees = Math.floor(abs / 100);
  const rest = abs % 100;
  const fraction = rest === 0 ? "" : `.${String(rest).padStart(2, "0")}`;
  return `${sign}₹${rupeeGrouping.format(rupees)}${fraction}`;
}
