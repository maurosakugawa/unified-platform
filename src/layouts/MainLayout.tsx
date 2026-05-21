// src/layouts/MainLayout.tsx

/**
 * Layout principal da aplicação
 *
 * Estrutura:
 * - Sidebar
 * - Header
 * - Área de conteúdo
 *
 * @author Mauro Sakugawa
 * @created 2026-05-21
 * @version 1.0.0
 * @license MIT
 */

import type { ReactNode } from "react";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface Props {
  children: ReactNode;

  title: string;
  subtitle: string;
}

export default function MainLayout({
  children,
  title,
  subtitle,
}: Props) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header
          title={title}
          subtitle={subtitle}
        />

        <main
          className="
            flex-1
            overflow-y-auto
            p-8
            bg-base-200
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
}