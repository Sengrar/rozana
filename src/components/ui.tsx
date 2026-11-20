import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

import type { FormState } from "@/lib/form-state";

import { Bi } from "./bi";

const controlClass =
  "block min-h-12 w-full border-2 border-rule-strong bg-sheet px-3 text-lg focus:border-action";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
};

/** A labelled text input with a large touch target. */
export function Field({
  id,
  label,
  hint,
  className = "",
  ...input
}: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-semibold">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={`${controlClass} ${className}`}
        {...input}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-ink-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
};

/** A labelled drop-down with a large touch target. */
export function SelectField({
  id,
  label,
  hint,
  className = "",
  children,
  ...select
}: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-semibold">
        {label}
      </label>
      <select
        id={id}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={`${controlClass} ${className}`}
        {...select}
      >
        {children}
      </select>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-ink-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

type Variant = "primary" | "secondary";

const buttonVariants: Record<Variant, string> = {
  primary: "bg-action text-action-ink",
  secondary: "border-2 border-action bg-sheet text-action",
};

/** Classes for anything that should look like a button (also links). */
export function buttonClass(variant: Variant = "primary", extra = "") {
  return `inline-flex min-h-12 items-center justify-center px-5 font-semibold disabled:opacity-60 ${buttonVariants[variant]} ${extra}`;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

/** A button at least 48px tall, so it is easy to tap on a small phone. */
export function Button({
  variant = "primary",
  className = "",
  ...button
}: ButtonProps) {
  return <button className={buttonClass(variant, className)} {...button} />;
}

type Tone = "error" | "info" | "ok";

const noticeTone: Record<Tone, string> = {
  error: "border-margin text-margin",
  info: "border-action text-ink",
  ok: "border-ok text-ok",
};

/** A message box with a coloured rule on the left. */
export function Notice({
  tone = "error",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`border-l-4 bg-paper px-3 py-2 ${noticeTone[tone]}`}
    >
      {children}
    </div>
  );
}

/** Shows the message a form action sent back, if any. */
export function FormMessage({ state }: { state: FormState }) {
  if (state.status === "idle") return null;
  return (
    <Notice tone={state.status === "ok" ? "ok" : "error"}>
      <Bi hi={state.message.hi} en={state.message.en} layout="stack" />
    </Notice>
  );
}
