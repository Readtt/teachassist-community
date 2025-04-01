export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Fragment } from "react";
import { auth } from "~/server/auth";
import Navbar from "../_components/navbar";
import Home from "./client";
import { getActiveClasses, getPastClasses } from "~/server/queries";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const activeClasses = await getActiveClasses();
  const pastClasses = await getPastClasses();

  return (
    <Fragment>
      <Navbar session={session} />
      <Home session={session} activeClasses={activeClasses} pastClasses={pastClasses} />
    </Fragment>
  );
}
