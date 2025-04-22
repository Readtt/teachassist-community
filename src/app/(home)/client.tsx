"use client";

import { ChartLineIcon, FlagIcon, RefreshCcw, UserIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import StatCard from "~/components/stat-card";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { Session } from "~/lib/auth-client";
import type { getUserClasses } from "~/server/queries";
import ClassCard from "./_components/class-card";
import ClassPlaceholder from "./_components/class-placeholder";
import { syncTAFromClient } from "./actions";

export default function Home({
  session,
  userClasses,
}: {
  session: Session;
  userClasses: Awaited<ReturnType<typeof getUserClasses>>;
}) {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (searchParams.get("created")) {
      setOpen(true);
    }
  }, [searchParams]);

  async function handleSync() {
    setIsSyncing(true);
    const { error, data } = await syncTAFromClient();

    if (error) {
      toast.error(error);
    } else {
      if (data?.updates?.length) {
        data.updates.forEach((u) => {
          const prev =
            u.previousMark !== null ? parseFloat(u.previousMark) : NaN;
          const next = u.newMark !== null ? parseFloat(u.newMark) : NaN;

          const percentageChange =
            !isNaN(prev) && !isNaN(next) && prev !== 0
              ? (((next - prev) / prev) * 100).toFixed(1)
              : null;

          const changeIndicator =
            percentageChange !== null
              ? ` (${Number(percentageChange) > 0 ? "+" : ""}${percentageChange}%)`
              : "";

          toast.success(
            `✅ ${u.code}: ${u.previousMark ?? "N/A"}% → ${u.newMark ?? "N/A"}%${changeIndicator}`,
          );
        });
      } else {
        toast.success("✅ Sync complete — no changes found.");
      }
    }

    setIsSyncing(false);
  }

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
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() =>
              window.open(
                "https://form.asana.com/?k=_Nd0NPG-oA_aMGTzErr4Yg&d=1143782360594635",
                "_blank",
              )
            }
            variant={"outline"}
          >
            <FlagIcon /> Report Issue
          </Button>
          <Button
            onClick={handleSync}
            LoadingIcon={RefreshCcw}
            isLoading={isSyncing}
            variant="secondary"
          >
            {!isSyncing && <RefreshCcw />}
            Sync Data
          </Button>
          <Link
            href={"/leaderboard"}
            className={buttonVariants({ variant: "highlight" })}
          >
            <ChartLineIcon /> Leaderboard
          </Link>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync Your Data</DialogTitle>
            <DialogDescription>
              Your data has been synced. Next time you get an assignment or test
              back with a mark, click <strong>Sync Data</strong> to update the
              leaderboard.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div className="mb-20 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Classes"
          description="Classes this semester"
          value={userClasses.length.toString()}
          icon={UserIcon}
          iconColor="stroke-blue-500"
        />
      </div>

      <Tabs defaultValue="current">
        <div className="flex flex-col justify-between gap-2 lg:flex-row">
          <h1 className="text-2xl font-semibold">Your Classes</h1>
          <TabsList>
            <TabsTrigger value="current">Current</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="current" className="mt-2">
          {userClasses.length === 0 ? (
            <ClassPlaceholder
              title="Active Classes"
              description="Your active classes will appear here. Click Sync Data to update classes."
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {userClasses.map((data) => (
                <ClassCard key={data.id} {...data} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
