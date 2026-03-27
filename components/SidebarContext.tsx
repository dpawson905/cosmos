"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

type SidebarState = {
  collapsed: boolean;
  mobileOpen: boolean;
  width: string;
  widthPx: number;
  toggle: () => void;
  setMobileOpen: (open: boolean) => void;
};

const SidebarContext = createContext<SidebarState>({
  collapsed: false,
  mobileOpen: false,
  width: "13rem",
  widthPx: 208,
  toggle: () => {},
  setMobileOpen: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const toggle = useCallback(() => setCollapsed((c) => !c), []);

  const width = collapsed ? "4rem" : "13rem";
  const widthPx = isMobile ? 0 : collapsed ? 64 : 208;

  return (
    <SidebarContext.Provider value={{ collapsed, mobileOpen, width, widthPx, toggle, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
