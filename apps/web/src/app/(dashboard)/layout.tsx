"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [osShortcut, setOsShortcut] = useState("⌘K");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isWindows = navigator.platform.toLowerCase().includes("win");
      setOsShortcut(isWindows ? "Ctrl+K" : "⌘K");
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-bg-app font-sans selection:bg-primary/30 selection:text-primary-light relative overflow-hidden">
      {/* Top Bar */}
      <header className="shrink-0 sticky top-0 z-40 flex items-center justify-between px-6 py-3 bg-bg-app/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3">
          <span className="text-base font-display font-semibold text-text-primary">
            {pathname?.startsWith("/quiz") ? "Practice Quizzes" :
             pathname?.startsWith("/ai-tutor") ? "AI Study Tutor" : "Dashboard"}
          </span>
        </div>

        {/* Command Palette Trigger */}
        <button
          className="flex items-center gap-3 px-3 py-1.5 text-xs rounded-lg transition-all duration-200 glass-card hover:bg-bg-card-hover text-text-muted hover:text-text-secondary border-border"
        >
          <span>Search or command...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] rounded font-mono bg-white/5 border border-border/50 text-text-muted">
             {osShortcut}
          </kbd>
        </button>
      </header>

      {/* Page Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col bg-bg-workspace">
        {children}
      </main>
    </div>
  );
}
