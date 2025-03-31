export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Fragment } from "react";
import { decryptPassword } from "~/lib/crypto";
import { emailToStudentId } from "~/lib/utils";
import { auth } from "~/server/auth";
import { getStudentTAInfo } from "~/server/teachassist";
import Navbar from "../_components/navbar";
import Home from "./client";
import syncTA from "~/server/sync";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const data = await syncTA(
    emailToStudentId(session.user.email),
    decryptPassword(session.user.taPassword),
  );

  return (
    <Fragment>
      <Navbar session={session} />
      <Home session={session} />
    </Fragment>
  );
}
