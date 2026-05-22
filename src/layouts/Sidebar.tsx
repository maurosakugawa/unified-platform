// src/layouts/Sidebar.tsx
/**
 * Sidebar principal da aplicação
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
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Eventos", icon: Calendar, path: "/eventos" },
  { label: "Contatos", icon: User, path: "/contatos" },
  { label: "Tarefas", icon: CheckSquare, path: "/tarefas" },
  { label: "Notas", icon: NotebookPen, path: "/notas" },
  { label: "Clima", icon: Sun, path: "/clima" },
  { label: "Configurações", icon: Settings, path: "/configuracoes" },
];

export function Sidebar() {
  return (
    <aside className="w-72 border-r border-base-300 bg-sidebar-bg p-6 flex flex-col transition-colors duration-300">
      {/* LOGO */}
      <h1 className="text-4xl font-bold text-primary mb-2">
        Smart Planner
      </h1>
      <p className="text-sm text-base-content/60 mb-8">
        Organize sua vida
      </p>

      {/* MENU */}
      <nav className="flex flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className="flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all hover:bg-base-300 hover:text-primary text-base-content"
            >
              <Icon size={22} />
              <span className="text-lg">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}