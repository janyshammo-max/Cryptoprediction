"use client";

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300"
        aria-label="Toggle theme"
      >
        …
      </button>
    );
  }

  const isDark = (theme === "system" ? resolvedTheme === "dark" : theme === "dark") ?? false;

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {isDark ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
      <span className="hidden sm:inline">{isDark ? "Donker" : "Licht"}</span>
    </button>
  );
}
