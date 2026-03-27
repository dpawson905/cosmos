"use client";

import { useSidebar } from "./SidebarContext";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { widthPx } = useSidebar();

  return (
    <main
      className="h-screen overflow-y-auto transition-all duration-300"
      style={{ marginLeft: `${widthPx}px` }}
    >
      {children}
    </main>
  );
}
