import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Fragment } from "react";
import { auth } from "~/server/auth";
import {
  getClassAverage,
  getClassRankings,
  getStudentClassAnonymity,
  getStudentClassRanking,
  getUserClasses,
} from "~/server/queries";
import Navbar from "../_components/navbar";
import Leaderboard from "./client";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect("/login");

  const userClasses = await getUserClasses();
  const params = await searchParams;
  const classCode =
    params?.code ?? userClasses[userClasses.length - 1]?.code ?? null;

  if (!classCode) redirect("/leaderboard?code=" + classCode);

  const [classRankings, studentClassRanking, classAverage, isAnonymous] =
    await Promise.all([
      getClassRankings(classCode),
      getStudentClassRanking(classCode),
      getClassAverage(classCode),
      getStudentClassAnonymity(classCode),
    ]);

  return (
    <Fragment>
      <Navbar session={session} />
      <Leaderboard
        session={session}
        userClasses={userClasses}
        classCode={classCode}
        classRankings={classRankings}
        studentClassRanking={studentClassRanking}
        classAverage={classAverage}
        isAnonymous={isAnonymous}
      />
    </Fragment>
  );
}
