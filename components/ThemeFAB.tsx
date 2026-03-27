"use client";

import { useEffect, useState, useCallback } from "react";
import { themes, DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/themes";

export default function ThemeFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(DEFAULT_THEME);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
    setCurrentTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const selectTheme = useCallback((themeName: string) => {
    setCurrentTheme(themeName);
    localStorage.setItem(THEME_STORAGE_KEY, themeName);
    document.documentElement.setAttribute("data-theme", themeName);
    setIsOpen(false);
  }, []);

  const currentIcon =
    themes.find((t) => t.name === currentTheme)?.icon ?? "🎨";

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed bottom-6 right-4 md:right-6 z-50 flex flex-col-reverse items-end gap-3">
        {/* Main FAB */}
        <button
          onClick={() => setIsOpen((o) => !o)}
          className="btn btn-circle btn-primary w-14 h-14 shadow-lg text-2xl transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
          aria-label="Theme switcher"
        >
          {isOpen ? "✕" : currentIcon}
        </button>

        {/* Faction options */}
        {themes.map((theme, i) => (
          <button
            key={theme.name}
            onClick={() => selectTheme(theme.name)}
            className={`
              flex items-center gap-2 transition-all duration-300 origin-bottom
              ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"}
            `}
            style={{ transitionDelay: isOpen ? `${(i + 1) * 60}ms` : "0ms" }}
            aria-label={`Switch to ${theme.label} theme`}
          >
            <span className="bg-base-300 text-base-content text-xs px-2 py-1 rounded-md shadow whitespace-nowrap">
              {theme.label}
            </span>
            <span
              className={`
                w-11 h-11 rounded-full flex items-center justify-center text-lg
                border-2 shadow-lg transition-shadow
                ${currentTheme === theme.name ? "ring-2 ring-primary ring-offset-2 ring-offset-base-100" : ""}
              `}
              style={{
                borderColor:
                  theme.colorScheme === "dark"
                    ? "oklch(60% 0.15 25)"
                    : "oklch(70% 0.1 230)",
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? "oklch(15% 0.02 250)"
                    : "oklch(95% 0.01 240)",
              }}
            >
              {theme.icon}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
