// src/main.tsx
/**
 * Entry point da aplicação.
 *
 * Providers globais:
 * - ThemeProvider
 * - BrowserRouter
 *
 * @author Mauro Sakugawa
 * @created 2026-05-21
 * @license MIT
 * @version 1.0.0
 */
import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import ThemeProvider from "./contexts/ThemeProvider";

import App from "./App";

import "./index.css";
import "./styles/theme.css";

ReactDOM.createRoot(
  document.getElementById(
    "root"
  ) as HTMLElement
).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);