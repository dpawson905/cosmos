"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/gallery", label: "Gallery", icon: "🖼️" },
  { href: "/neo", label: "NEOs", icon: "☄️" },
  { href: "/iss", label: "ISS", icon: "🛰️" },
  { href: "/launches", label: "Launches", icon: "🚀" },
  { href: "/starlink", label: "Starlink", icon: "🌐" },
  { href: "/solar", label: "Solar", icon: "☀️" },
  { href: "/about", label: "About", icon: "ℹ️" },
];

export default function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="btm-nav btm-nav-sm lg:hidden z-40">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={isActive ? "active" : ""}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="btm-nav-label text-xs">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
