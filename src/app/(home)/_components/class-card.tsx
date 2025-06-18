"use client";

import { ChevronRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { cn } from "~/lib/utils";
import type { getUserClasses } from "~/server/queries";

type ClassCardProps = Awaited<ReturnType<typeof getUserClasses>>[number];

export default function ClassCard({
  room,
  name,
  code,
  overallMark,
  block,
  isFinal,
  isMidterm,
  schoolIdentifier,
}: ClassCardProps) {
  const router = useRouter();

  return (
    <Card
      onClick={() => {
        router.push("/leaderboard/class/" + code + "/?school=" + schoolIdentifier);
      }}
      className="flex h-full cursor-pointer flex-col gap-4 py-4 pb-6"
    >
      <CardHeader>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground text-xs">
            {parseInt(room) ? `Room ${room}` : room}
          </span>
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

      <CardContent className="flex flex-grow flex-col justify-between gap-4">
        {/* Other content can go here if needed */}

        <div className="mt-auto flex flex-col gap-2">
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
              {overallMark ? `${Number(overallMark).toFixed(1)}%` : "N/A"}
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
        <Badge className="text-center whitespace-normal" variant={"secondary"}>
          {schoolIdentifier}
        </Badge>
        <div className="mt-auto flex justify-end">
          <Button variant="link" className="p-0 has-[>svg]:px-0">
            View Leaderboard <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
