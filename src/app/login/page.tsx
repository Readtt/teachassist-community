import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import Login from "./client";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) redirect("/");

  return <Login />;
}
