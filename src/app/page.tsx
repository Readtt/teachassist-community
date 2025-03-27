export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import Navbar from "./_components/navbar";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  return (
    <>
      <Navbar session={session} />
      <main>

      </main>
    </>
  );
}
