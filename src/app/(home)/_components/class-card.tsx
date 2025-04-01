"use client";

import { useRouter } from "next/navigation";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { cn } from "~/lib/utils";
import type { getActiveClasses, getPastClasses } from "~/server/queries";

type ClassCardProps =
  | Awaited<ReturnType<typeof getActiveClasses>>[number]
  | Awaited<ReturnType<typeof getPastClasses>>[number];
export default function ClassCard({
  room,
  name,
  code,
  overallMark,
  assignments,
  block,

  isFinal,
  isMidterm,
}: ClassCardProps) {
  const router = useRouter();

  return (
    <Card onClick={() => {router.push("/leaderboard?code=" + code)}} className="flex h-full flex-col gap-4 py-4 pb-6 cursor-pointer">
      <CardHeader>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground text-xs">Room {room}</span>
          <Badge variant={"secondary"}>Period {block}</Badge>
        </div>
        <CardTitle className="tracking-tight">
          {name ?? code}{" "}
          <span
            className={cn("text-xs", {
              "text-red-500": isFinal,
              "text-orange-500": isMidterm,
            })}
          >
            {isFinal ? "FINAL" : isMidterm ? "MIDTERM" : ""}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span>Current Grade</span>
            <span
              className={cn("text-2xl font-semibold", {
                "text-green-500": Number(overallMark) >= 80,
                "text-yellow-500":
                  Number(overallMark) >= 50 && Number(overallMark) < 80,
                "text-red-500": Number(overallMark) < 50,
                "text-muted-foreground": overallMark == null,
              })}
            >
              {overallMark ? `${overallMark}%` : "N/A"}
            </span>
          </div>
          <Progress
            bgColor={
              overallMark == null
                ? "bg-muted-foreground"
                : Number(overallMark) >= 80
                  ? "bg-green-500"
                  : Number(overallMark) >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
            }
            value={Number(overallMark) ?? 0}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs">
            Latest Graded Item
          </span>
          <p className="text-sm font-medium">
            {assignments[0]?.name ?? "No assignments"}
          </p>
        </div>
        {/* <div className="mt-auto flex justify-end">
          <Button
            variant="link"
            className="p-0 text-blue-500 hover:text-blue-500 has-[>svg]:px-0"
          >
            View Details <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div> */}
      </CardContent>
    </Card>
  );
}
