// src/contexts/ThemeProvider.tsx

/**
 * Provider responsável pelo gerenciamento
 * do tema global da aplicação.
 *
 * @author Mauro Sakugawa
 * @created 2026-05-21
 * @license MIT
 * @version 1.0.0
 */

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  ThemeContext,
  type Theme,
} from "./ThemeContext";

interface Props {
  children: ReactNode;
}

export function ThemeProvider({
  children,
}: Props) {
  const [theme, setTheme] =
    useState<Theme>(() => {
      const savedTheme =
        localStorage.getItem("theme");

      return savedTheme === "dark"
        ? "dark"
        : "light";
    });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) =>
      prev === "light"
        ? "dark"
        : "light"
    );
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}