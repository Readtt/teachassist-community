import { WebhookIcon } from "lucide-react";
import { cn } from "~/lib/utils";

export default function Logo({ className }: { className: string }) {
  return <WebhookIcon className={cn("w-6 h-6 shrink-0 text-blue-500", className)} />;
}