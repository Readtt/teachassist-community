"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";

const Banner = () => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <section className="bg-blue-500 text-white w-full border-b py-1 shadow-sm">
      <div className="container mx-auto flex items-center justify-between gap-2">
        <div className="flex-1 text-center">
          <span className="text-sm">
            <span className="font-medium">🎉 Version 2.0 is here!</span>{" "}
            <span className="text-blue-100">
              Spread the word
            </span>
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="-mr-2 h-8 w-8 flex-none"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
};

export { Banner };
