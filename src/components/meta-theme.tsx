"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function MetaTheme() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const themeColor = resolvedTheme === "dark" ? "#000000" : "#ffffff"; // your dark/light values
    const meta = document.querySelector('meta[name="theme-color"]');

    if (meta) {
      meta.setAttribute("content", themeColor);
    } else {
      const metaTag = document.createElement("meta");
      metaTag.setAttribute("name", "theme-color");
      metaTag.setAttribute("content", themeColor);
      document.head.appendChild(metaTag);
    }
  }, [resolvedTheme, mounted]);

  return null;
}