"use client";

import {
  AwardIcon,
  BookIcon,
  ChartLineIcon,
  ChevronRightIcon,
  GraduationCapIcon,
  RefreshCcw,
  SparklesIcon,
  UsersIcon,
} from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { Session } from "~/lib/auth-client";

const stats = [
  {
    title: "Current GPA",
    value: "3.8",
    Icon: GraduationCapIcon,
    color: "green",
  },
  {
    title: "Overall Average",
    value: "81.1%",
    Icon: SparklesIcon,
    color: "yellow",
  },
  { title: "Grade Ranking", value: "#12", Icon: AwardIcon, color: "purple" },
  { title: "Active Classes", value: "4", Icon: UsersIcon, color: "blue" },
];

const classes = [
  {
    room: "Room 203",
    name: "Advanced Functions",
    grade: 92,
    latestItem: "Derivatives quiz",
  },
];

export default function Home({
  session,
}: {
  session: Session;
}) {
  return (
    <main className="container py-12">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-semibold tracking-tight">
            Welcome back,{" "}
            <span className="text-blue-500">{session.user.name}</span>
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your account today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCcw />
            Sync Data
          </Button>
          <Button onClick={() => redirect("/leaderboard")} variant="highlight">
            <ChartLineIcon /> Leaderboard
          </Button>
        </div>
      </div>

      <div className="mb-20 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ title, value, Icon, color }) => (
          <Card key={title} className="gap-2 py-4 pb-6">
            <CardHeader>
              <CardTitle className="text-muted-foreground flex flex-1 items-center justify-between text-sm tracking-tight">
                {title}
                <Icon
                  className={`bg-muted h-8 w-8 rounded-full stroke-${color}-500 p-1.5 text-white`}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h1 className="text-2xl font-semibold">{value}</h1>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="current">
        <div className="flex flex-col justify-between gap-2 lg:flex-row">
          <h1 className="text-2xl font-semibold">Your Classes</h1>
          <TabsList>
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="current" className="mt-2">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {classes.map(({ room, name, grade, latestItem }) => (
              <Card key={name} className="gap-4 py-4 pb-6">
                <CardHeader>
                  <span className="text-muted-foreground text-xs">{room}</span>
                  <CardTitle className="tracking-tight">{name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span>Current Grade</span>
                      <span className="text-2xl font-semibold text-green-500">
                        {grade}%
                      </span>
                    </div>
                    <Progress value={grade} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">
                      Latest Graded Item
                    </span>
                    <p className="text-sm font-medium">{latestItem}</p>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="link"
                      className="p-0 text-blue-500 hover:text-blue-500 has-[>svg]:px-0"
                    >
                      View Details <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="past" className="mt-2">
          <Card className="w-full">
            <div className="flex flex-col items-center justify-center gap-2">
              <BookIcon className="text-muted-foreground h-12 w-12" />
              <h1 className="text-lg font-medium">Past Classes</h1>
              <span className="text-muted-foreground">
                Your past classes will appear here
              </span>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
