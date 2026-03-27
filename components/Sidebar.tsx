"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSidebar } from "./SidebarContext";

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/gallery", label: "Gallery", icon: "🖼️" },
  { href: "/neo", label: "Near Earth", icon: "☄️" },
  { href: "/iss", label: "ISS Live", icon: "🛰️" },
  { href: "/launches", label: "Launches", icon: "🚀" },
  { href: "/starlink", label: "Starlink", icon: "🌐" },
  { href: "/solar", label: "Solar", icon: "☀️" },
  { href: "/about", label: "About", icon: "ℹ️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, mobileOpen, width, toggle, setMobileOpen } = useSidebar();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  // Close mobile drawer on escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [setMobileOpen]);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="fixed top-3 left-3 z-50 btn btn-sm btn-ghost lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 stroke-current">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen flex flex-col bg-base-200 border-r border-base-300
          transition-all duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
        style={{ width }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 min-h-14">
          <Link href="/" className={`font-bold text-primary truncate ${collapsed ? "text-lg text-center w-full" : "text-xl"}`}>
            {collapsed ? "✦" : "✦ COSMOS"}
          </Link>
          {/* Close button on mobile */}
          <button
            className="btn btn-xs btn-ghost lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-2">
          <ul className="menu gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`${isActive ? "active" : ""} ${collapsed ? "justify-center px-0" : ""}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button
          className="hidden lg:flex items-center justify-center p-3 border-t border-base-300 text-base-content/40 hover:text-base-content/70 transition-colors"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={`w-5 h-5 stroke-current transition-transform ${collapsed ? "rotate-180" : ""}`}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </aside>
    </>
  );
}
