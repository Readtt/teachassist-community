"use client";

import { ChevronLeftIcon, EarthIcon } from "lucide-react";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { Session } from "~/lib/auth-client";

const stats = [
  {
    title: "Your Global Rank",
    description: "Among all students",
    value: "#11",
    icon: EarthIcon,
    iconColor: "stroke-green-500",
  },
];

const classes = [
  { value: "advancedfunctions", label: "Advanced Functions" },
  { value: "english", label: "English" },
  { value: "french", label: "French" },
  { value: "compsci", label: "Computer Science" },
];

const leaderboardData = [
  { rank: "1", studentId: "348617341", grade: "81.1%", courses: "5" },
];

export default function Leaderboard({  }: { session: Session }) {
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
          <h1 className="text-4xl font-semibold tracking-tight">Student Leaderboard</h1>
          <p className="text-muted-foreground">See how you compare to other anonymized students</p>
        </div>
      </div>
      <div className="mb-20 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index} className="gap-2 py-4 pb-6">
            <CardHeader>
              <CardTitle className="flex flex-1 items-center justify-between text-lg tracking-tight">
                {stat.title}
                <stat.icon className={`bg-muted h-8 w-8 rounded-full p-1.5 text-white ${stat.iconColor}`} />
              </CardTitle>
              <CardDescription>{stat.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <h1 className="text-2xl font-semibold">{stat.value}</h1>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="global">
        <div className="flex flex-col justify-between gap-2 lg:flex-row">
          <h1 className="text-2xl font-semibold">Student Rankings</h1>
          <TabsList>
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="class">By Class</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="global" className="mt-2">
          <div className="rounded-lg border">
            <Table className="overflow-clip rounded-lg">
              <TableHeader className="bg-secondary">
                <TableRow>
                  <TableHead className="w-[100px]">Rank</TableHead>
                  <TableHead>Overall Grade</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead className="text-right">Courses</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="p-4 font-medium">{entry.rank}</TableCell>
                    <TableCell>{entry.grade}</TableCell>
                    <TableCell>{entry.studentId}</TableCell>
                    <TableCell className="text-right">{entry.courses}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="class" className="mt-2">
          <div className="mb-6 flex flex-col">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls, index) => (
                  <SelectItem key={index} value={cls.value}>{cls.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-lg border">
            <Table className="overflow-clip rounded-lg">
              <TableHeader className="bg-secondary">
                <TableRow>
                  <TableHead className="w-[100px]">Rank</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Overall Grade</TableHead>
                  <TableHead className="text-right">Courses</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="p-4 font-medium">{entry.rank}</TableCell>
                    <TableCell>{entry.studentId}</TableCell>
                    <TableCell>{entry.grade}</TableCell>
                    <TableCell className="text-right">{entry.courses}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}