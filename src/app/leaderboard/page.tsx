export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Fragment } from "react";
import { auth } from "~/server/auth";
import Navbar from "../_components/navbar";
import Leaderboard from "./client";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <Fragment>
      <Navbar session={session} />
      <Leaderboard session={session} />
    </Fragment>
  );
}
