// src/components/ui/EmptyState.tsx
/**
 * 
 * @author Mauro Sakugawa
 * @created 2026-05-21
 * @license MIT License
 * @version 1.0.0
 */
import { CalendarDays } from "lucide-react";

export default function EmptyState() {
  return (
    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        py-20
        text-center
      "
    >
      <CalendarDays
        size={64}
        className="text-slate-300"
      />

      <h3
        className="
          mt-4
          text-xl
          font-semibold
          text-slate-700
        "
      >
        Nenhum evento cadastrado
      </h3>

      <p className="text-slate-400 mt-2">
        Crie seu primeiro compromisso.
      </p>
    </div>
  );
}