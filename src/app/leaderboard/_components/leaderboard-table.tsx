"use client";

import { DessertIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { getRankingsData } from "~/server/queries";

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
}: {
  data: Awaited<ReturnType<typeof getRankingsData>>["data"]["rankings"];
  page?: number;
  title: string;
  subTitle?: string;
  maxPages: number;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const createPageHref = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    return `?${params.toString()}`;
  };

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
            <TableHead>Class</TableHead>
            <TableHead>Student</TableHead>
            <TableHead className="text-right">Overall Grade</TableHead>
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
      <Pagination>
        <PaginationContent>
          {/* Previous */}
          <PaginationItem>
            <PaginationPrevious
              onClick={() => router.push(createPageHref(page - 1))}
              aria-disabled={page <= 1}
              className={
                page <= 1 ? "pointer-events-none opacity-50" : undefined
              }
            />
          </PaginationItem>

          {/* First Page */}
          <PaginationItem>
            <PaginationLink
              onClick={() => router.push(createPageHref(1))}
              isActive={page === 1}
            >
              1
            </PaginationLink>
          </PaginationItem>

          {/* Left Ellipsis */}
          {page > 3 && <Separator orientation="vertical" />}

          {/* Pages Around Current */}
          {[-1, 0, 1].map((offset) => {
            const p = page + offset;
            if (p > 1 && p < maxPages) {
              return (
                <PaginationItem key={p}>
                  <PaginationLink
                    onClick={() => router.push(createPageHref(p))}
                    isActive={page === p}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              );
            }
            return null;
          })}

          {/* Right Ellipsis */}
          {page < maxPages - 3 && <Separator orientation="vertical" />}

          {/* Last Page */}
          {maxPages > 1 && (
            <PaginationItem>
              <PaginationLink
                onClick={() => router.push(createPageHref(maxPages))}
                isActive={page === maxPages}
              >
                {maxPages}
              </PaginationLink>
            </PaginationItem>
          )}

          {/* Next */}
          <PaginationItem>
            <PaginationNext
              onClick={() => router.push(createPageHref(page + 1))}
              aria-disabled={page >= maxPages}
              className={
                page >= maxPages ? "pointer-events-none opacity-50" : undefined
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
