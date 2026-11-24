import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const KEY = "simplechat:theme";
const QUERY = "(prefers-color-scheme: dark)";
const META_COLOR: Record<Theme, string> = {
  light: "#fdfdfd",
  dark: "#121210",
};

function readStored(): Theme | null {
  try {
    const value = localStorage.getItem(KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function readSystem(): Theme {
  return matchMedia(QUERY).matches ? "dark" : "light";
}

export function useTheme() {
  const [stored, setStored] = useState<Theme | null>(readStored);
  const [system, setSystem] = useState<Theme>(readSystem);
  const theme: Theme = stored ?? system;

  useEffect(() => {
    const media = matchMedia(QUERY);
    const onChange = () => setSystem(media.matches ? "dark" : "light");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", META_COLOR[theme]);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setStored(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* storage unavailable: theme still applies for this session */
    }
  }, []);

  const toggle = useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [theme, setTheme],
  );

  return { theme, setTheme, toggle };
}
