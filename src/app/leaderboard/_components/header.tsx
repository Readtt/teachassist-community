"use client";

import { ChevronLeftIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Fragment } from "react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Fragment>
      <div
        onClick={() => {
          if(pathname == "/leaderboard") {
            router.push("/")
          } else {
            router.push("/leaderboard")
          }
        }}
        className="text-muted-foreground hover:text-primary mb-6 flex w-fit cursor-pointer items-center gap-1.5 transition-all"
      >
        <ChevronLeftIcon className="h-4 w-4" /> Back
      </div>
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-semibold tracking-tight">
            Student Leaderboard
          </h1>
          <p className="text-muted-foreground">
            See how you compare to other students and view other classes
          </p>
        </div>
      </div>
    </Fragment>
  );
}
