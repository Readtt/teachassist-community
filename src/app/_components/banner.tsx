"use client";

import Link from "next/link";
import { Github, X } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";

const Banner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <section className="w-full bg-muted py-1.5">
      <div className="container mx-auto flex items-center justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center justify-center gap-2 text-sm text-foreground">
            <Github className="h-4 w-4" />
            <span className="font-medium">We&apos;re open source!</span>

            <Link
              href="https://github.com/Readtt/teachassist-community"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Check us out on GitHub
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="-mr-2 h-8 w-8 flex-none"
          onClick={() => setIsVisible(false)}
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
};

export { Banner };
