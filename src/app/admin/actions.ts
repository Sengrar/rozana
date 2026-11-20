"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isMemberRole } from "@/lib/auth/roles";
import { requirePlatformAdmin } from "@/lib/auth/viewer";
import { endOfDayIST, isDateInput } from "@/lib/dates";
import { message, type FormState } from "@/lib/form-state";
import { isSubscriptionStatus } from "@/lib/subscriptions";
import { createClient } from "@/lib/supabase/server";
import { checkSlug, isEmail, isUuid } from "@/lib/validation";

// Every action checks the role again: a server action is a public endpoint,
// so it must not rely on the page having checked. The database checks too.

const brokenForm = message(
  "फ़ॉर्म में कुछ गड़बड़ है। पन्ना दोबारा खोलें।",
  "Something is wrong with the form. Reload the page.",
);
const notAllowed = message(
  "यह काम सिर्फ़ सुपर एडमिन कर सकता है।",
  "Only a super admin can do this.",
);

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

/** Create a shop and start its trial (calls admin_create_tenant). */
export async function createShop(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requirePlatformAdmin("/admin/shops/new");

  const name = field(formData, "name");
  const slug = field(formData, "slug").toLowerCase();
  const planCode = field(formData, "plan");
  const trialDaysText = field(formData, "trial_days");
  const values = { name, slug, plan: planCode, trial_days: trialDaysText };

  if (!name) {
    return {
      status: "error",
      message: message("दुकान का नाम भरें।", "Enter the shop name."),
      values,
    };
  }
  const slugProblem = checkSlug(slug);
  if (slugProblem) return { status: "error", message: slugProblem, values };

  const trialDays = Number(trialDaysText);
  if (!Number.isInteger(trialDays) || trialDays < 0 || trialDays > 365) {
    return {
      status: "error",
      message: message(
        "ट्रायल के दिन 0 से 365 के बीच हों।",
        "Trial days must be between 0 and 365.",
      ),
      values,
    };
  }

  const supabase = await createClient();
  const { data: tenantId, error } = await supabase.rpc("admin_create_tenant", {
    p_slug: slug,
    p_name: name,
    p_plan_code: planCode,
    p_trial_days: trialDays,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: message(
          "यह सबडोमेन पहले से किसी दुकान का है।",
          "This subdomain is already taken.",
        ),
        values,
      };
    }
    if (error.code === "42501") {
      return { status: "error", message: notAllowed, values };
    }
    return {
      status: "error",
      message: message(
        `दुकान नहीं बनी: ${error.message}`,
        `Could not create the shop: ${error.message}`,
      ),
      values,
    };
  }

  revalidatePath("/admin");
  redirect(`/admin/shops/${tenantId}?created=1`);
}

/** Change a shop's plan, subscription status and trial end date. */
export async function updateSubscription(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const tenantId = field(formData, "tenant_id");
  await requirePlatformAdmin(`/admin/shops/${tenantId}`);

  const planId = field(formData, "plan_id");
  const status = field(formData, "status");
  const trialEnd = field(formData, "trial_end");
  const values = { plan_id: planId, status, trial_end: trialEnd };

  if (!isUuid(tenantId) || !isUuid(planId) || !isSubscriptionStatus(status)) {
    return { status: "error", message: brokenForm, values };
  }
  if (trialEnd && !isDateInput(trialEnd)) {
    return {
      status: "error",
      message: message("तारीख़ सही नहीं है।", "That date is not valid."),
      values,
    };
  }
  if (status === "trialing" && !trialEnd) {
    return {
      status: "error",
      message: message(
        "ट्रायल के लिए आख़िरी तारीख़ भरें।",
        "A trial needs an end date.",
      ),
      values,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({
      plan_id: planId,
      status,
      trial_ends_at: trialEnd ? endOfDayIST(trialEnd) : null,
    })
    .eq("tenant_id", tenantId)
    .select("id")
    .single();

  if (error) {
    return {
      status: "error",
      message: message(
        `सेव नहीं हुआ: ${error.message}`,
        `Could not save: ${error.message}`,
      ),
      values,
    };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/shops/${tenantId}`);
  return {
    status: "ok",
    message: message("बदलाव सेव हो गया।", "Changes saved."),
  };
}

/** Give an existing login a role in a shop (calls admin_set_member). */
export async function addMember(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const tenantId = field(formData, "tenant_id");
  await requirePlatformAdmin(`/admin/shops/${tenantId}`);

  const email = field(formData, "email").toLowerCase();
  const role = field(formData, "role");
  const values = { email, role };

  if (!isUuid(tenantId) || !isMemberRole(role)) {
    return { status: "error", message: brokenForm, values };
  }
  if (!isEmail(email)) {
    return {
      status: "error",
      message: message("सही ईमेल भरें।", "Enter a valid email."),
      values,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_member", {
    p_tenant: tenantId,
    p_email: email,
    p_role: role,
  });

  if (error) {
    if (error.code === "P0002") {
      return {
        status: "error",
        message: message(
          "इस ईमेल का कोई खाता नहीं है। पहले Supabase में बनाएँ (Authentication → Add user)।",
          "No login with this email. Create it in Supabase first (Authentication → Add user).",
        ),
        values,
      };
    }
    if (error.code === "PGRST202") {
      return {
        status: "error",
        message: message(
          "डेटाबेस अपडेट बाकी है: supabase/migrations/0002_admin_members.sql चलाएँ।",
          "Database update missing: run supabase/migrations/0002_admin_members.sql.",
        ),
        values,
      };
    }
    if (error.code === "42501") {
      return { status: "error", message: notAllowed, values };
    }
    return {
      status: "error",
      message: message(
        `नहीं जोड़ पाए: ${error.message}`,
        `Could not add: ${error.message}`,
      ),
      values,
    };
  }

  revalidatePath(`/admin/shops/${tenantId}`);
  return {
    status: "ok",
    message: message(`${email} जोड़ दिया गया।`, `${email} added.`),
  };
}

/** Remove a person from a shop. Their login stays; only the role goes. */
export async function removeMember(formData: FormData) {
  const tenantId = field(formData, "tenant_id");
  await requirePlatformAdmin(`/admin/shops/${tenantId}`);

  const membershipId = field(formData, "membership_id");
  if (!isUuid(tenantId) || !isUuid(membershipId)) {
    throw new Error("Invalid remove-member form");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("memberships")
    .delete()
    .eq("id", membershipId)
    .eq("tenant_id", tenantId);
  if (error) throw new Error(`Could not remove member: ${error.message}`);

  revalidatePath(`/admin/shops/${tenantId}`);
}
