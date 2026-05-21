// src/components/ui/Card.tsx
/**
 * 
 * @author Mauro Sakugawa
 * @created 2026-05-21
 * @license MIT License
 * @version 1.0.0
 */
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
}

export default function Card({
  children,
}: CardProps) {
  return (
    <div
      className="
        bg-white
        rounded-2xl
        shadow-sm
        border
        border-slate-200
        p-6
      "
    >
      {children}
    </div>
  );
}