"use client";

import { useActionState } from "react";

import { Bi } from "@/components/bi";
import { Button, Field, FormMessage, SelectField } from "@/components/ui";
import { memberRoles, roleLabels } from "@/lib/auth/roles";
import { idleState } from "@/lib/form-state";

import { addMember } from "../../actions";

export function AddMemberForm({ tenantId }: { tenantId: string }) {
  const [state, formAction, pending] = useActionState(addMember, idleState);
  const values = state.status === "error" ? state.values : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="tenant_id" value={tenantId} />

      <Field
        id="member_email"
        name="email"
        type="email"
        label={<Bi hi="व्यक्ति का ईमेल" en="Person's email" />}
        hint={
          <Bi
            hi="पहले उनका लॉगिन Supabase में बनाएँ (Authentication → Add user)। रोल बदलना हो तो दोबारा जोड़ें।"
            en="Create their login in Supabase first (Authentication → Add user). Add again to change a role."
            layout="stack"
          />
        }
        defaultValue={values?.email}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        required
      />

      <SelectField
        id="member_role"
        name="role"
        label={<Bi hi="रोल" en="Role" />}
        defaultValue={values?.role ?? "merchant_admin"}
      >
        {memberRoles.map((role) => (
          <option key={role} value={role}>
            {roleLabels[role].hi} / {roleLabels[role].en}
          </option>
        ))}
      </SelectField>

      <FormMessage state={state} />

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? (
          <Bi hi="जोड़ रहे हैं…" en="Adding…" />
        ) : (
          <Bi hi="दुकान में जोड़ें" en="Add to shop" />
        )}
      </Button>
    </form>
  );
}
