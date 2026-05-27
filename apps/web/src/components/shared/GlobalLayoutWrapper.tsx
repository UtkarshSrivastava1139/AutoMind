"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import React from "react";

export function GlobalLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  if (isHomepage) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <div 
        className="flex-1 flex flex-col min-h-screen" 
        style={{ paddingLeft: "var(--sidebar-width, 64px)" }}
      >
        {children}
      </div>
    </>
  );
}
