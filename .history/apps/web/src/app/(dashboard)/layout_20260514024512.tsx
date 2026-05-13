"use client";

import "../question-solver.css";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", icon: "⊞", label: "Dashboard" },
  { href: "/simulator", icon: "◉", label: "Simulator" },
  { href: "/question-solver", icon: "🧠", label: "Q-Solver" },
  { href: "/regex", icon: "⚡", label: "Regex" },
  { href: "/quiz", icon: "✦", label: "Quizzes" },
  { href: "/ai-tutor", icon: "✧", label: "AI Tutor" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "var(--color-bg-app)" }}>
      {/* Left Sidebar — 64px icon-based (per design.md) */}
      <aside
        className="fixed left-0 top-0 bottom-0 flex flex-col items-center py-6 z-50"
        style={{
          width: "var(--sidebar-width)",
          background: "var(--color-bg-app)",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        {/* Logo */}
        <Link href="/" className="mb-8">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden"
            style={{ background: "transparent" }}
          >
            <Image src="/logo.png" alt="AutoMind Logo" width={36} height={36} />
          </div>
        </Link>

        {/* Nav Items */}
        <nav className="flex flex-col items-center gap-2 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-150"
                style={{
                  background: isActive ? "rgba(99, 102, 241, 0.15)" : "transparent",
                  color: isActive ? "var(--color-primary-light)" : "var(--color-text-muted)",
                }}
              >
                {item.icon}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: Settings / Profile */}
        <div className="flex flex-col items-center gap-2">
          <Link
            href="/settings"
            title="Settings"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-150"
            style={{ color: "var(--color-text-muted)" }}
          >
            ⚙
          </Link>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{
              background: "var(--color-primary)",
              color: "white",
            }}
          >
            U
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen" style={{ marginLeft: "var(--sidebar-width)" }}>
        {/* Top Bar */}
        <header
          className="sticky top-0 z-40 flex items-center justify-between px-6 py-3"
          style={{
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
              {navItems.find((n) => pathname?.startsWith(n.href))?.label || "AutoMind"}
            </span>
          </div>

          {/* Command Palette Trigger */}
          <button
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-all duration-150 glass-card"
            style={{ color: "var(--color-text-muted)" }}
            onClick={() => {
              // Command palette will be implemented with shadcn/ui cmdk
            }}
          >
            <span>Search or command...</span>
            <kbd
              className="px-1.5 py-0.5 text-[10px] rounded font-mono"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--color-border)",
              }}
            >
              ⌘K
            </kbd>
          </button>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
