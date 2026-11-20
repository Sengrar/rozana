"use client";

import { useActionState } from "react";

import { Bi } from "@/components/bi";
import { Button, Field, FormMessage, SelectField } from "@/components/ui";
import { idleState } from "@/lib/form-state";
import { formatPaise } from "@/lib/money";

import { createShop } from "../../actions";

type PlanOption = { code: string; name: string; price_month_paise: number };

export function CreateShopForm({ plans }: { plans: PlanOption[] }) {
  const [state, formAction, pending] = useActionState(createShop, idleState);
  const values = state.status === "error" ? state.values : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage state={state} />

      <Field
        id="name"
        name="name"
        label={<Bi hi="दुकान का नाम" en="Shop name" />}
        defaultValue={values?.name}
        maxLength={80}
        required
      />

      <Field
        id="slug"
        name="slug"
        label={<Bi hi="सबडोमेन" en="Subdomain" />}
        hint={
          <Bi
            hi="दुकान का पता बनेगा: sharma-bakery.आपका-डोमेन। सिर्फ़ a-z, 0-9 और -; 3 से 32 अक्षर। बाद में नहीं बदलेगा।"
            en="Becomes the shop's address: sharma-bakery.your-domain. Only a-z, 0-9 and -; 3 to 32 characters. Cannot change later."
            layout="stack"
          />
        }
        defaultValue={values?.slug}
        pattern="[a-z0-9][a-z0-9\-]{1,30}[a-z0-9]"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        maxLength={32}
        required
      />

      <SelectField
        id="plan"
        name="plan"
        label={<Bi hi="प्लान" en="Plan" />}
        defaultValue={values?.plan ?? "growth"}
      >
        {plans.map((plan) => (
          <option key={plan.code} value={plan.code}>
            {plan.name} · {formatPaise(plan.price_month_paise)} / महीना (month)
          </option>
        ))}
      </SelectField>

      <Field
        id="trial_days"
        name="trial_days"
        type="number"
        inputMode="numeric"
        min={0}
        max={365}
        label={<Bi hi="ट्रायल के दिन" en="Trial days" />}
        defaultValue={values?.trial_days ?? "15"}
        required
      />

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? (
          <Bi hi="बन रही है…" en="Creating…" />
        ) : (
          <Bi hi="दुकान बनाएँ" en="Create shop" />
        )}
      </Button>
    </form>
  );
}
