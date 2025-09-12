import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import Login from "./client";
import { db } from "~/server/db";
import { course } from "~/server/db/schema";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const TRUSTED_SCHOOLS = await db
    .selectDistinct({
      schoolIdentifier: course.schoolIdentifier,
    })
    .from(course);

  if (session) redirect("/");

  return <Login TRUSTED_SCHOOLS={TRUSTED_SCHOOLS.map(r => r.schoolIdentifier)} />;
}
