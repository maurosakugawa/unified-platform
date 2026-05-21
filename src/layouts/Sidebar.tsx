// src/layouts/Sidebar.tsx
/**
 * 
 * @author Mauro Sakugawa
 * @created 2026-05-21
 * @license MIT License
 * @version 1.0.0
 */

import {
  Calendar,
  LayoutDashboard,
  NotebookPen,
  Sun,
  User,
  CheckSquare,
  Settings,
} from "lucide-react";

const items = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Eventos",
    icon: Calendar,
  },
  {
    label: "Contatos",
    icon: User,
  },
  {
    label: "Tarefas",
    icon: CheckSquare,
  },
  {
    label: "Notas",
    icon: NotebookPen,
  },
  {
    label: "Clima",
    icon: Sun,
  },
  {
    label: "Configurações",
    icon: Settings,
  },
];

export function Sidebar() {
  return (
    <aside
      className="
        w-72
        bg-base-100
        border-r
        border-base-300
        p-6
        hidden
        md:flex
        flex-col
      "
    >
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-violet-600">
          Smart Planner
        </h1>
      </div>

      <nav className="flex flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              className="
                flex
                items-center
                gap-3
                p-4
                rounded-2xl
                hover:bg-violet-50
                transition
                text-gray-700
              "
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}