export type Theme = {
  name: string;
  label: string;
  icon: string;
  colorScheme: "light" | "dark";
};

export const themes: Theme[] = [
  { name: "blue-nebula", label: "Blue Nebula", icon: "🌌", colorScheme: "light" },
  { name: "red-giant", label: "Red Giant", icon: "⚡", colorScheme: "dark" },
  { name: "deep-orbit", label: "Deep Orbit", icon: "🔥", colorScheme: "dark" },
  { name: "lunar-base", label: "Lunar Base", icon: "🏛️", colorScheme: "light" },
];

export const DEFAULT_THEME = "blue-nebula";
export const THEME_STORAGE_KEY = "cosmos-theme";
