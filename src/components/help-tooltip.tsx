"use client";

import { HelpCircleIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";

export default function HelpTooltip({
  content,
  className,
}: {
  content: ReactNode;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button disabled size={"icon"} variant={"secondary"}>
          <HelpCircleIcon className={cn("h-4 w-4", className)} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={10}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
