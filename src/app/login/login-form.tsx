"use client";

import { useActionState } from "react";

import { Bi } from "@/components/bi";
import { Button, Field, Notice } from "@/components/ui";

import { signIn, type LoginError, type LoginState } from "./actions";

const errorText: Record<LoginError, { hi: string; en: string }> = {
  missing: {
    hi: "ईमेल और पासवर्ड दोनों भरें।",
    en: "Enter both email and password.",
  },
  invalid: {
    hi: "ईमेल या पासवर्ड सही नहीं है।",
    en: "Email or password is not correct.",
  },
  rate_limited: {
    hi: "बहुत बार कोशिश हुई। कुछ मिनट बाद फिर कोशिश करें।",
    en: "Too many tries. Try again in a few minutes.",
  },
  unavailable: {
    hi: "अभी सर्वर से नहीं जुड़ पा रहे। थोड़ी देर बाद कोशिश करें।",
    en: "Cannot reach the server right now. Try again shortly.",
  },
};

const initialState: LoginState = { error: null, email: "" };

export function LoginForm({ next }: { next: string | null }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}

      {state.error && (
        <Notice>
          <Bi
            hi={errorText[state.error].hi}
            en={errorText[state.error].en}
            layout="stack"
          />
        </Notice>
      )}

      <Field
        id="email"
        name="email"
        type="email"
        label={<Bi hi="ईमेल" en="Email" />}
        defaultValue={state.email}
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        required
      />

      <Field
        id="password"
        name="password"
        type="password"
        label={<Bi hi="पासवर्ड" en="Password" />}
        autoComplete="current-password"
        required
      />

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? (
          <Bi hi="रुकिए…" en="Please wait…" />
        ) : (
          <Bi hi="लॉग इन करें" en="Log in" />
        )}
      </Button>
    </form>
  );
}
