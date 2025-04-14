import { ChevronRight } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "~/components/ui/card";
import { auth } from "~/server/auth";
import { getUserClasses } from "~/server/queries";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const userClasses = await getUserClasses();

  return (
    <div className="flex flex-col gap-2">
      {
        <div className="flex flex-col gap-2">
          {userClasses.length === 0 ? (
            <Card className="flex w-full flex-row items-center justify-between px-4 py-4">
              <div className="flex flex-col justify-center">
                <p className="font-medium">
                  Waiting for your classes to be added...
                </p>
                <p className="text-muted-foreground text-xs">
                  Check back soon or contact your teacher. When you&apos;re ready, sync your data!
                </p>
              </div>
            </Card>
          ) : (
            userClasses.map((cls) => (
              <Link key={cls.id} href={`/leaderboard/class/${cls.code}?school=${cls.schoolIdentifier}`}>
                <Card className="flex w-full cursor-pointer flex-row items-center justify-between px-4 py-2">
                  <div className="flex flex-col justify-center">
                    <p className="text-xs">{cls.code}</p>
                    <p className="font-semibold">
                      {cls.name ?? "Unknown Class"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {cls.schoolIdentifier}
                    </p>
                  </div>
                  <ChevronRight />
                </Card>
              </Link>
            ))
          )}
        </div>
      }
    </div>
  );

  // return (
  //   <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
  //     {leaderboardOptions.map((option) => (
  //       <Link key={option.title} href={option.path}>
  //         <Card className="flex h-full cursor-pointer flex-col justify-between">
  //           <CardHeader>
  //             <div className="bg-primary/10 mb-3 w-fit rounded-lg p-2">
  //               {option.icon}
  //             </div>
  //             <CardTitle>{option.title}</CardTitle>
  //             <p className="text-muted-foreground">{option.description}</p>
  //           </CardHeader>
  //         </Card>
  //       </Link>
  //     ))}
  //   </div>
  // );
}

// import { headers } from "next/headers";
// import { redirect } from "next/navigation";
// import { Fragment } from "react";
// import { auth } from "~/server/auth";
// import {
//   getClassAverage,
//   getClassRankings,
//   getStudentClassAnonymity,
//   getStudentClassRanking,
//   getUserClasses,
// } from "~/server/queries";
// import Navbar from "../_components/navbar";
// import Leaderboard from "./client";

// export const dynamic = "force-dynamic";

// export default async function Page({
//   searchParams,
// }: {
//   searchParams?: Promise<Record<string, string | undefined>>;
// }) {
//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });
//   if (!session) redirect("/login");

//   const userClasses = await getUserClasses();
//   const params = await searchParams;
//   const classCode =
//     params?.code ?? userClasses[userClasses.length - 1]?.code ?? null;

//   if (!classCode) redirect("/leaderboard?code=" + classCode);

//   const [classRankings, studentClassRanking, classAverage, isAnonymous] =
//     await Promise.all([
//       getClassRankings(classCode),
//       getStudentClassRanking(classCode),
//       getClassAverage(classCode),
//       getStudentClassAnonymity(classCode),
//     ]);

//   return (
//     <></>
//     // <Fragment>
//     //   <Navbar session={session} />
//     //   <Leaderboard
//     //     session={session}
//     //     userClasses={userClasses}
//     //     classCode={classCode}
//     //     classRankings={classRankings}
//     //     studentClassRanking={studentClassRanking}
//     //     classAverage={classAverage}
//     //     isAnonymous={isAnonymous}
//     //   />
//     // </Fragment>
//   );
// }
