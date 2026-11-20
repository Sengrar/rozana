/** A message shown to the user in Hindi and English. */
export type Message = { hi: string; en: string };

/**
 * What a form's server action returns. On error it can send back what was
 * typed (`values`), so the form keeps it instead of clearing.
 */
export type FormState =
  | { status: "idle" }
  | { status: "ok"; message: Message }
  | { status: "error"; message: Message; values?: Record<string, string> };

export const idleState: FormState = { status: "idle" };

export function message(hi: string, en: string): Message {
  return { hi, en };
}
