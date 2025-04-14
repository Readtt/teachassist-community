import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Fragment } from "react";
import { auth } from "~/server/auth";
import Navbar from "../_components/navbar";
import Header from "./_components/header";

export default async function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect("/login");

  return (
    <Fragment>
      <Navbar session={session} />
      <main className="container py-12">
        <Header />
        {children}
      </main>
    </Fragment>
  );
}
