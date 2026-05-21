// src/layouts/Header.tsx

/**
 * Header principal da aplicação
 *
 * Responsável por exibir:
 * - título da página
 * - descrição
 * - busca global
 *
 * @author Mauro Sakugawa
 * @created 2026-05-21
 * @version 1.0.0
 * @license MIT License
 */

import { Search } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export function Header({
  title,
  subtitle,
}: HeaderProps) {
  return (
    <header
      className="
        h-20
        bg-white
        border-b
        border-gray-100
        px-8
        flex
        items-center
        justify-between
      "
    >
      <div>
        <h2 className="text-2xl font-bold">
          {title}
        </h2>

        <p className="text-sm text-gray-500">
          {subtitle}
        </p>
      </div>

      <div className="relative">
        <Search
          className="absolute left-3 top-3 text-gray-400"
          size={18}
        />

        <input
          placeholder="Buscar..."
          className="
            input
            input-bordered
            rounded-xl
            pl-10
            w-72
          "
        />
      </div>
    </header>
  );
}