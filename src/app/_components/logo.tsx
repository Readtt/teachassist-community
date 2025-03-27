import { cn } from "~/lib/utils";
import { SignatureIcon } from "lucide-react";

export default function Logo({ className }: { className: string }) {
  return <SignatureIcon className={cn("w-6 h-6 shrink-0 text-blue-500", className)} />;
}