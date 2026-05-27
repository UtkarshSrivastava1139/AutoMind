"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Sliders, Brain, Code, BookOpen, Bot, Settings } from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/simulator", icon: Sliders, label: "Simulator" },
  { href: "/question-solver", icon: Brain, label: "Q-Solver" },
  { href: "/regex", icon: Code, label: "Regex" },
  { href: "/quiz", icon: BookOpen, label: "Quizzes" },
  { href: "/ai-tutor", icon: Bot, label: "AI Tutor" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 flex flex-col items-center py-6 z-[60] bg-bg-app border-r border-border shrink-0"
      style={{ width: "var(--sidebar-width, 64px)" }}
    >
      {/* Logo */}
      <Link href="/" className="mb-8 group">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <Image src="/logo.png" alt="AutoMind Logo" width={36} height={36} className="object-contain" />
        </div>
      </Link>

      {/* Nav Items */}
      <nav className="flex flex-col items-center gap-3 flex-1 w-full px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isActive
                  ? "bg-primary/15 text-primary-light shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2)]"
                  : "text-text-muted hover:text-text-primary hover:bg-bg-card-hover"
              }`}
            >
              <Icon size={18} />
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Settings / Profile */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        <Link
          href="/settings"
          title="Settings"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-all duration-300"
        >
          <Settings size={18} />
        </Link>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-semibold bg-primary text-white cursor-pointer hover:shadow-glow-primary transition-shadow duration-300">
          U
        </div>
      </div>
    </aside>
  );
}
