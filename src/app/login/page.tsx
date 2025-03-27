import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Login from "./client";
import { auth } from "~/server/auth";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/");
  }

  return <Login />;
}
