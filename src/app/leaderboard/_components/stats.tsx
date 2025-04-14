import { EarthIcon, UserIcon, UsersIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { z } from "zod";
import type { leaderboardModes } from "~/common/types/leaderboard-modes";
import StatCard from "~/components/stat-card";

// Helper to get color based on numeric value
function getColor(value: number | null) {
  if (value == null) return { icon: "stroke-muted-foreground", text: "text-muted-foreground" };
  if (value >= 80) return { icon: "stroke-green-500", text: "text-green-500" };
  if (value >= 50) return { icon: "stroke-yellow-500", text: "text-yellow-500" };
  return { icon: "stroke-red-500", text: "text-red-500" };
}

// Helper to format average values
function formatAverage(value: number | null) {
  return value == null ? "N/A" : `${Math.round(value * 100) / 100}%`;
}

// Helper to format student average which comes in as string
function parseStudentAverage(value: string | null) {
  return value ? parseInt(value) : null;
}

export default function Stats({
  mode,
  description,
  studentAverage,
  studentRank,
  totalAverage,
  totalStudents,
  averageDescription
}: {
  mode: z.infer<typeof leaderboardModes>;
  description: string;
  studentAverage: string | null;
  studentRank: number | null;
  totalAverage: number | null;
  totalStudents: number;
  averageDescription: ReactNode
}) {
  const sAverage = parseStudentAverage(studentAverage);
  const studentColors = getColor(sAverage);
  const totalColors = getColor(totalAverage);

  return (
    <div className="mt-4 mb-20 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      <StatCard
        title={`Your ${mode} Rank`}
        description={description}
        value={studentRank ? `#${studentRank}` : "N/A"}
        subValue={studentRank ? `/${totalStudents} students` : undefined}
        icon={EarthIcon}
        iconColor="stroke-green-500"
      />
      <StatCard
        title="Your Average"
        description={averageDescription}
        value={studentAverage ? `${studentAverage}%` : "N/A"}
        icon={UserIcon}
        iconColor={studentColors.icon}
        valueTextColor={studentColors.text}
      />
      <StatCard
        title={`${mode} Average`}
        description={description}
        value={formatAverage(totalAverage)}
        icon={UsersIcon}
        iconColor={totalColors.icon}
        valueTextColor={totalColors.text}
      />
    </div>
  );
}
