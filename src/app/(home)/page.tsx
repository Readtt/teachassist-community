export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Fragment } from "react";
import { auth } from "~/server/auth";
import { getUserClasses } from "~/server/queries";
import Navbar from "../_components/navbar";
import Home from "./client";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userClasses = await getUserClasses();

  return (
    <Fragment>
      <Navbar session={session} />
      <Home session={session} userClasses={userClasses} />
    </Fragment>
  );
}
