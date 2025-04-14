"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "~/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { toggleAnonymousFromClient } from "../actions";

export default function AnonymousSwitch({
  code,
  school,
  studentAnonymity,
}: {
  code: string;
  school: string;
  studentAnonymity: boolean;
}) {
  const [isAnonymous, setIsAnonymous] = useState<boolean>(studentAnonymity);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setLoading(true);

    const result = await toggleAnonymousFromClient(code, school);

    if (result.error) {
      toast.error(result.error);
      setIsAnonymous(() => !checked); // Revert to previous state
    } else {
      setIsAnonymous(checked);
      toast.success(`You are now ${checked ? "private" : "public"}`);
    }

    setLoading(false);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1">
          <Switch
            onCheckedChange={handleToggle}
            checked={isAnonymous}
            disabled={loading}
            className="data-[state=checked]:bg-blue-500"
          />
          <span>Anonymous</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={10}>
        Toggle anonymity for this course code
      </TooltipContent>
    </Tooltip>
  );
}
