import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { cn } from "~/lib/utils";
import type { ReactNode } from "react";

export default function StatCard(stat: {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  description: ReactNode;
  value: string;
  subValue?: string;
  valueTextColor?: string;
}) {
  return (
    <Card className="gap-2 py-4 pb-6">
      <CardHeader>
        <CardTitle className="capitalize flex flex-1 items-center justify-between text-lg tracking-tight gap-1">
          {stat.title}
          <stat.icon
            className={`bg-muted h-8 w-8 rounded-full p-1.5 text-white ${stat.iconColor}`}
          />
        </CardTitle>
        <CardDescription>{stat.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <h1 className={cn("text-2xl font-semibold", stat.valueTextColor)}>{stat.value} {stat.subValue && (<span className="text-muted-foreground text-xs">{stat.subValue}</span>)}</h1>
      </CardContent>
    </Card>
  );
}
