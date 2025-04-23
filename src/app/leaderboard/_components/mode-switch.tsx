"use client";

import { BookIcon, GlobeIcon, Loader2, SchoolIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { z } from "zod";
import type { leaderboardModes } from "~/common/types/leaderboard-modes";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default function ModeSwitch({
  defaultValue,
  extra,
}: {
  defaultValue: z.infer<typeof leaderboardModes>;
  extra: {
    code: string;
    school: string;
  };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | undefined>();

  const navigate = (mode: z.infer<typeof leaderboardModes>) => {
    setIsLoading(mode);
    switch (mode) {
      case "class":
        router.push(`/leaderboard/class/${extra.code}?school=${extra.school}`);
        break;
      case "school":
        router.push(`/leaderboard/school/${extra.code}?school=${extra.school}`);
        break;
      case "global":
        router.push(`/leaderboard/global/${extra.code}?school=${extra.school}`);
        break;
      // case "teams":
      //   router.push(`/leaderboard/global/${extra.code}?school=${extra.school}`);
      //   break;
    }
  };

  const tabs = [
    { value: "class", icon: <BookIcon className="h-4 w-4" />, label: "Class" },
    {
      value: "school",
      icon: <SchoolIcon className="h-4 w-4" />,
      label: "School",
    },
    {
      value: "global",
      icon: <GlobeIcon className="h-4 w-4" />,
      label: "Global",
    },
    // {
    //   value: "teams",
    //   icon: <UsersIcon className="h-4 w-4" />,
    //   label: "Teams",
    // },
  ];

  return (
    <Tabs value={defaultValue}>
      <TabsList>
        {tabs.map(({ value, icon, label }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="cursor-pointer"
            onClick={() => {
              if (value !== defaultValue) navigate(value as z.infer<typeof leaderboardModes>);
            }}
          >
            <div className="flex items-center gap-1">
              {icon} {label}
              {isLoading === value && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
            </div>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
