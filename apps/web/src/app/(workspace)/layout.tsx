"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TutorDrawer } from "@/components/shared/TutorDrawer";
import { useState, useEffect } from "react";
import { Bot } from "lucide-react";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [osShortcut, setOsShortcut] = useState("⌘E");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isWindows = navigator.platform.toLowerCase().includes("win");
      setOsShortcut(isWindows ? "Ctrl+E" : "⌘E");
    }
  }, []);

  // Basic title inference based on path
  let workspaceTitle = "Workspace";
  if (pathname?.includes("/simulator")) workspaceTitle = "Automata Lab";
  else if (pathname?.includes("/regex")) workspaceTitle = "Regex Converter";
  else if (pathname?.includes("/question-solver")) workspaceTitle = "Question Solver";

  return (
    <div className="flex-1 h-full w-full flex flex-col overflow-hidden bg-bg-app font-sans text-text-primary selection:bg-primary/30 selection:text-primary-light">
      {/* Top Navigation Bar */}
      <header className="h-[57px] shrink-0 flex items-center justify-between px-4 border-b border-border bg-bg-app z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Image src="/logo.png" alt="AutoMind Logo" width={24} height={24} className="object-contain" />
            </div>
            <span className="text-sm font-display font-semibold text-text-primary hidden sm:inline-block">
              AutoMind
            </span>
          </Link>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-sm font-display font-medium text-text-secondary">
              {workspaceTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Workspace specific actions can be injected here via portals or state in the future, 
              but for now standard layout actions */}
          <Button 
            variant={isTutorOpen ? "secondary" : "ghost"} 
            size="sm" 
            className="hidden sm:inline-flex gap-2"
            onClick={() => setIsTutorOpen(!isTutorOpen)}
          >
            <Bot size={16} className={isTutorOpen ? "text-primary" : "text-text-secondary"} />
            <span>AI Tutor</span>
          </Button>

          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
             <Link href="/dashboard">Exit</Link>
          </Button>
          <Button variant="default" size="sm" className="gap-2">
            <span className="text-xs">Export</span>
            <span className="text-xs opacity-70">{osShortcut}</span>
          </Button>
        </div>
      </header>

      {/* Main Workspace Area (Canvas + Panels) - Children handle their own interior layouts */}
      <main className="flex-1 relative flex overflow-hidden">
        {/* Child features (Canvas) */}
        <div className={`flex-1 relative transition-all duration-300 ${isTutorOpen ? "mr-[400px]" : "mr-0"}`}>
          {children}
        </div>

        {/* Global AI Tutor Drawer */}
        <TutorDrawer isOpen={isTutorOpen} onToggle={() => setIsTutorOpen(!isTutorOpen)} />
      </main>
    </div>
  );
}