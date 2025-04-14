"use client";

import { SearchIcon } from "lucide-react";
import { Fragment, useState } from "react";
import { Button } from "~/components/ui/button";

export default function Search() {
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  return (
    <Fragment>
      <Button
        onClick={() => setSearchOpen(!searchOpen)}
        variant={"outline"}
        className="flex-1 justify-start md:w-sm"
        disabled
      >
        <SearchIcon />
        <span className="text-muted-foreground flex-1">Search <span className="text-xs">(coming soon)</span>...</span>
      </Button>
    </Fragment>
  );
}
