"use client";

import {
  CheckIcon,
  ChevronLeftIcon,
  EarthIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react";
import { redirect } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import StatCard from "~/components/stat-card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { Session } from "~/lib/auth-client";
import type {
  getActiveClasses,
  getClassAverage,
  getClassRankings,
  getStudentClassAnonymity,
  getStudentClassRanking,
} from "~/server/queries";
import { toggleAnonymous } from "./actions";
import { tryCatch } from "~/server/helpers";
import { toast } from "sonner";

export default function Leaderboard({
  activeClasses,
  classCode,
  classRankings,
  studentClassRanking,
  classAverage,
  isAnonymous,
}: {
  session: Session;
  activeClasses: Awaited<ReturnType<typeof getActiveClasses>>;
  classCode: string | null;
  classRankings: Awaited<ReturnType<typeof getClassRankings>>;
  studentClassRanking: Awaited<ReturnType<typeof getStudentClassRanking>>;
  classAverage: Awaited<ReturnType<typeof getClassAverage>> | null;
  isAnonymous: Awaited<ReturnType<typeof getStudentClassAnonymity>>;
}) {
  const [isSettingAnonymous, setIsSettingAnonymous] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  async function handleToggleAnonymity() {
    if (classCode === null) {
      toast.error(
        "You must specify a class code to toggle anonymity for that class.",
      );
      return;
    }

    setIsSettingAnonymous(true);
    const { error, data } = await tryCatch(toggleAnonymous(classCode));
    if (error) {
      toast.error(error.message);
    } else {
      if (data?.isAnonymous) {
        toast.success("Your student ID is private.");
      } else {
        toast.success("Your student ID is public.");
      }
    }

    setIsSettingAnonymous(false);
  }

  useEffect(() => {
    console.log(isAnonymous);
  }, [isAnonymous]);

  return (
    <main className="container py-12">
      <p
        onClick={() => redirect("/")}
        className="text-muted-foreground hover:text-primary mb-6 flex w-fit cursor-pointer items-center gap-1.5 transition-all"
      >
        <ChevronLeftIcon className="h-4 w-4" /> Back
      </p>
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-semibold tracking-tight">
            Student Leaderboard
          </h1>
          <p className="text-muted-foreground">
            See how you compare to other students
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleToggleAnonymity}
            isLoading={isSettingAnonymous}
            variant={isAnonymous ? "secondary" : "outline"}
          >
            {!isSettingAnonymous && <CheckIcon />} {!isAnonymous && "Set"}{" "}
            Anonymous
          </Button>
          <Button
            onClick={() => setSearchOpen(!searchOpen)}
            variant={"outline"}
          >
            <SearchIcon /> Search Classes
          </Button>
        </div>
      </div>

      <CommandDialog
        modal={true}
        open={searchOpen}
        onOpenChange={setSearchOpen}
      >
        <CommandInput placeholder="Search class name or code..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Active Classes">
            {activeClasses.map(({ id, name, code }) => (
              <CommandItem
                onSelect={() => {
                  setSearchOpen(false);
                  redirect("?code=" + code);
                }}
                key={id}
              >
                <div className="flex w-full flex-wrap items-center gap-2">
                  <Fragment>
                    <span>{name ?? "Unknown Class"}</span>
                    <Badge variant={"outline"}>{code}</Badge>
                  </Fragment>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {activeClasses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2">
            <h1 className="text-lg font-semibold">
              You have no active classes.
            </h1>
            <p className="text-muted-foreground text-sm">
              Come back when you have some classes to view the leaderboards.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Fragment>
          <div className="mb-20 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <StatCard
              title={`Your Global Rank`}
              description={`Among all ${classCode} students`}
              value={
                studentClassRanking?.rank
                  ? `#${studentClassRanking.rank}`
                  : "N/A"
              }
              icon={EarthIcon}
              iconColor="stroke-green-500"
            />
            <StatCard
              title={`Class Average`}
              description={`Among all ${classCode} students`}
              value={classAverage ? (Math.round(classAverage * 100) / 100) + "%" : "N/A"}
              icon={UsersIcon}
              iconColor={
                classAverage == null
                  ? "stroke-muted-foreground"
                  : classAverage >= 80
                    ? "stroke-green-500"
                    : classAverage >= 50
                      ? "stroke-yellow-500"
                      : "stroke-red-500"
              }
              valueTextColor={
                classAverage == null
                  ? "text-muted-foreground"
                  : classAverage >= 80
                    ? "text-green-500"
                    : classAverage >= 50
                      ? "text-yellow-500"
                      : "text-red-500"
              }
            />
          </div>

          <div className="flex flex-col justify-between gap-2 lg:flex-row">
            <h1 className="text-2xl font-semibold">
              Student Rankings {classCode && `For ${classCode}`}
            </h1>
          </div>
          <div className="bg-card mt-4 rounded-lg border shadow-md">
            <Table className="overflow-clip rounded-lg">
              <TableHeader className="bg-secondary text-primary-foreground">
                <TableRow>
                  <TableHead className="w-[100px] text-center">Rank</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-right">Overall Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classRankings.map((data) => {
                  const gradeColor =
                    data.overallMark == null
                      ? "text-muted-foreground"
                      : Number(data.overallMark) >= 80
                        ? "text-green-500"
                        : Number(data.overallMark) >= 50
                          ? "text-yellow-500"
                          : "text-red-500";

                  return (
                    <TableRow
                      key={data.id}
                      className="hover:bg-muted transition"
                    >
                      <TableCell className="text-center font-medium">
                        {data.rank}
                      </TableCell>
                      <TableCell>{data.code}</TableCell>
                      <TableCell>
                        {data.studentId ? (
                          <div>{data.studentId}</div>
                        ) : (
                          <div className="blur-xs select-none">000000000</div>
                        )}
                      </TableCell>
                      <TableCell className={`p-2 text-right font-semibold`}>
                        <span className={gradeColor}>
                          {data.overallMark ? `${data.overallMark}%` : "N/A"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Fragment>
      )}
    </main>
  );
}
