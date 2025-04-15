import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Fragment } from "react";
import { auth } from "~/server/auth";
import { getRankingsData } from "~/server/queries";
import AnonymousSwitch from "../../_components/anonymous-switch";
import LeaderboardTable from "../../_components/leaderboard-table";
import ModeSwitch from "../../_components/mode-switch";
import Stats from "../../_components/stats";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{
    page: string | undefined;
    school: string | undefined;
  }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect("/login");

  const { code: classCode } = await params;
  const { page: pageParam, school: schoolParam } = await searchParams;
  if (!schoolParam) redirect("/leaderboard");
  const page = parseInt(pageParam ?? "1");

  const { data } = await getRankingsData({
    mode: "class",
    code: classCode,
    school: schoolParam,
    page: page,
  });

  return (
    <Fragment>
      <div className="flex flex-wrap items-center justify-between gap-4 md:gap-2">
        <ModeSwitch
          defaultValue="class"
          extra={{ code: classCode, school: schoolParam }}
        />
        <AnonymousSwitch
          code={classCode}
          school={schoolParam}
          studentAnonymity={data.student.isAnonymous ?? true}
        />
      </div>
      <Stats
        mode="class"
        description={`Among ${classCode} students`}
        studentAverage={data.student.average}
        studentRank={data.student.rank}
        totalAverage={data.average}
        totalStudents={data.totalStudents}
        averageDescription={
          <span>
            Your current average for{" "}
            <span className="font-semibold">{classCode}</span> in{" "}
            <span className="font-semibold">{schoolParam}</span>
          </span>
        }
      />
      <LeaderboardTable
        title={`Rankings for ${classCode}`}
        subTitle={schoolParam}
        data={data.rankings}
        page={page}
        maxPages={data.maxPages}
        totalRecords={data.totalStudents}
      />
    </Fragment>
  );
}
