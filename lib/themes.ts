export type Theme = {
  name: string;
  label: string;
  icon: string;
  colorScheme: "light" | "dark";
};

export const themes: Theme[] = [
  { name: "jedi-order", label: "Jedi Order", icon: "\u2694\uFE0F", colorScheme: "light" },
  { name: "sith-empire", label: "Sith Empire", icon: "\u26A1", colorScheme: "dark" },
  { name: "rebel-alliance", label: "Rebel Alliance", icon: "\uD83D\uDD25", colorScheme: "dark" },
  { name: "galactic-empire", label: "Galactic Empire", icon: "\uD83C\uDFDB\uFE0F", colorScheme: "light" },
];

export const DEFAULT_THEME = "jedi-order";
export const THEME_STORAGE_KEY = "cosmos-theme";
