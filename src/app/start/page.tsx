import { redirect } from "next/navigation";

import { getViewer, homePathFor } from "@/lib/auth/viewer";

/** After login: send each person to the screen for their role. */
export default async function StartPage() {
  const viewer = await getViewer();
  redirect(viewer ? homePathFor(viewer) : "/login");
}
