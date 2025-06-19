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
import { cn, schoolIdentifierToAcronym } from "~/lib/utils";
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
  totalRecords,
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
                  <div className="flex items-center">
                    <span className={gradeColor}>
                      {data.overallMark
                        ? `${Number(data.overallMark).toFixed(1)}%`
                        : "N/A"}
                    </span>
                    <span
                      className={cn("ml-1 text-xs font-bold tracking-tighter", {
                        "text-red-500": data.isFinal,
                        "text-orange-500": data.isMidterm,
                      })}
                    >
                      {data.isFinal ? "FINAL" : data.isMidterm ? "MIDTERM" : ""}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  {data.studentId ? (
                    <div>{data.studentId}</div>
                  ) : (
                    <div className="blur-xs select-none">000000000</div>
                  )}
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-muted-foreground text-xs">
                    Synced{" "}
                    {data.lastSyncedAt
                      ? (() => {
                          const now = new Date();
                          const last = new Date(data.lastSyncedAt);
                          const diff = Math.floor(
                            (now.getTime() - last.getTime()) / 1000,
                          );
                          if (diff < 60) return "now";
                          if (diff < 3600)
                            return `${Math.floor(diff / 60)}m ago`;
                          if (diff < 86400)
                            return `${Math.floor(diff / 3600)}h ago`;
                          if (diff < 604800)
                            return `${Math.floor(diff / 86400)}d ago`;
                          if (diff < 2592000)
                            return `${Math.floor(diff / 604800)}w ago`;
                          if (diff < 31536000)
                            return `${Math.floor(diff / 2592000)}mo ago`;
                          return `${Math.floor(diff / 31536000)}y ago`;
                        })()
                      : null}
                  </span>
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
      <PaginationControls
        currentPage={page}
        maxPages={maxPages}
        totalRecords={totalRecords}
      />
    </div>
  );
}
