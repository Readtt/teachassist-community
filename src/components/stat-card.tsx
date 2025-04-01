import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { cn } from "~/lib/utils";

export default function StatCard(stat: {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  description: string;
  value: string;
  valueTextColor?: string;
}) {
  return (
    <Card className="gap-2 py-4 pb-6">
      <CardHeader>
        <CardTitle className="flex flex-1 items-center justify-between text-lg tracking-tight">
          {stat.title}
          <stat.icon
            className={`bg-muted h-8 w-8 rounded-full p-1.5 text-white ${stat.iconColor}`}
          />
        </CardTitle>
        <CardDescription>{stat.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <h1 className={cn("text-2xl font-semibold", stat.valueTextColor)}>{stat.value}</h1>
      </CardContent>
    </Card>
  );
}
