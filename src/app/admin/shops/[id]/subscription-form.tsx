"use client";

import { useActionState } from "react";

import { Bi } from "@/components/bi";
import { Button, Field, FormMessage, SelectField } from "@/components/ui";
import { idleState } from "@/lib/form-state";
import { formatPaise } from "@/lib/money";
import { statusLabels, subscriptionStatuses } from "@/lib/subscriptions";

import { updateSubscription } from "../../actions";

type PlanOption = { id: string; name: string; price_month_paise: number };

type Current = {
  planId: string;
  status: string;
  /** YYYY-MM-DD in India time, or "" when there is no trial end. */
  trialEnd: string;
};

export function SubscriptionForm({
  tenantId,
  plans,
  current,
}: {
  tenantId: string;
  plans: PlanOption[];
  current: Current;
}) {
  const [state, formAction, pending] = useActionState(
    updateSubscription,
    idleState,
  );
  const values = state.status === "error" ? state.values : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="tenant_id" value={tenantId} />

      <SelectField
        id="plan_id"
        name="plan_id"
        label={<Bi hi="प्लान" en="Plan" />}
        defaultValue={values?.plan_id ?? current.planId}
      >
        {plans.map((plan) => (
          <option key={plan.id} value={plan.id}>
            {plan.name} · {formatPaise(plan.price_month_paise)} / महीना (month)
          </option>
        ))}
      </SelectField>

      <SelectField
        id="status"
        name="status"
        label={<Bi hi="स्थिति" en="Status" />}
        defaultValue={values?.status ?? current.status}
      >
        {subscriptionStatuses.map((status) => (
          <option key={status} value={status}>
            {statusLabels[status].hi} / {statusLabels[status].en}
          </option>
        ))}
      </SelectField>

      <Field
        id="trial_end"
        name="trial_end"
        type="date"
        label={<Bi hi="ट्रायल की आख़िरी तारीख़" en="Trial end date" />}
        hint={
          <Bi
            hi="उस दिन रात 11:59 बजे तक (भारत समय)।"
            en="Until 11:59 pm that day, India time."
          />
        }
        defaultValue={values?.trial_end ?? current.trialEnd}
      />

      <FormMessage state={state} />

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? (
          <Bi hi="सेव हो रहा है…" en="Saving…" />
        ) : (
          <Bi hi="सेव करें" en="Save" />
        )}
      </Button>
    </form>
  );
}
