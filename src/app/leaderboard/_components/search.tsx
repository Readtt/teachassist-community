"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { Input } from "~/components/ui/input";
import HelpTooltip from "~/components/help-tooltip";

export default function Search() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);

  // Debounce typing
  useEffect(() => {
    const timeout = setTimeout(() => {
      const encoded = encodeURIComponent(query.trim());
      const current = searchParams.get("q") ?? "";

      if (encoded !== current) {
        router.push(encoded ? `?q=${encoded}` : "/leaderboard");
      }
    }, 400);

    return () => clearTimeout(timeout); // reset on new keystroke
  }, [query]);

  return (
    <div className="flex w-full items-center gap-2 py-4">
      <div className="relative w-full max-w-md">
        <SearchIcon className="text-muted-foreground absolute top-[50%] left-3 h-5 w-5 -translate-y-1/2" />
        <Input
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10"
        />
      </div>
      <HelpTooltip content="Search classes" />
    </div>
  );
}