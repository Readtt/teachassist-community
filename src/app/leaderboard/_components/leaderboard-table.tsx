"use client";

import { DessertIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { schoolIdentifierToAcronym } from "~/lib/utils";
import type { getRankingsData } from "~/server/queries";
import PaginationControls from "./pagination-controls";

// columns: rank, code, student, overall grade, pagination,
// search: student
// filter: anonymous
// anonymous switch

export default function LeaderboardTable({
  data,
  page = 1,
  maxPages,
  title,
  subTitle,
  totalRecords
}: {
  data: Awaited<ReturnType<typeof getRankingsData>>["data"]["rankings"];
  page?: number;
  title: string;
  subTitle?: string;
  maxPages: number;
  totalRecords: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subTitle && (
          <p className="text-muted-foreground text-sm">{subTitle}</p>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] text-center">Rank</TableHead>
            <TableHead>Overall Grade</TableHead>
            <TableHead className="text-left">Student</TableHead>
            <TableHead className="text-left">Class</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length == 0 && (
            <TableRow>
              <TableCell colSpan={4} className="h-40 text-center">
                <div className="text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <DessertIcon className="text-muted-foreground h-8 w-8" />
                  <p className="text-sm">No results found</p>
                </div>
              </TableCell>
            </TableRow>
          )}
          {data.map((data) => {
            const gradeColor =
              data.overallMark == null
                ? "text-muted-foreground"
                : Number(data.overallMark) >= 80
                  ? "text-green-500"
                  : Number(data.overallMark) >= 50
                    ? "text-yellow-500"
                    : "text-red-500";

            return (
              <TableRow key={data.id}>
                <TableCell className="text-center font-medium">
                  {data.rank}
                </TableCell>
                <TableCell className={`p-2 text-left font-semibold`}>
                  <span className={gradeColor}>
                    {data.overallMark ? `${data.overallMark}%` : "N/A"}
                  </span>
                </TableCell>
                <TableCell>
                  {data.studentId ? (
                    <div>{data.studentId}</div>
                  ) : (
                    <div className="blur-xs select-none">000000000</div>
                  )}
                </TableCell>
                <TableCell className="text-left">
                  {data.code}{" "}
                  <span className="text-muted-foreground text-xs">
                    {schoolIdentifierToAcronym(data.schoolIdentifier ?? "")}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <PaginationControls currentPage={page} maxPages={maxPages} totalRecords={totalRecords} />
    </div>
  );
}
