import { signOut } from "@/app/auth/actions";
import type { Message } from "@/lib/form-state";

import { Bi } from "./bi";
import { Button } from "./ui";

/** A plain form, so signing out works even before JavaScript loads. */
export function SignOutButton({
  next,
  label = { hi: "लॉग आउट", en: "Log out" },
  className = "",
}: {
  /** Page to return to after the next login. */
  next?: string;
  label?: Message;
  className?: string;
}) {
  return (
    <form action={signOut}>
      {next && <input type="hidden" name="next" value={next} />}
      <Button type="submit" variant="secondary" className={className}>
        <Bi hi={label.hi} en={label.en} />
      </Button>
    </form>
  );
}
