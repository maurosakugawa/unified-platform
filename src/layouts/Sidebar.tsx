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

import { NavLink } from "react-router-dom";

const items = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },

  {
    label: "Eventos",
    icon: CheckSquare,
    path: "/events",
  },

  {
    label: "Calendário",
    icon: Calendar,
    path: "/calendar",
  },

  {
    label: "Contatos",
    icon: User,
    path: "/contacts",
  },

  {
    label: "Notas",
    icon: NotebookPen,
    path: "/notes",
  },

  {
    label: "Clima",
    icon: Sun,
    path: "/weather",
  },

  {
    label: "Configurações",
    icon: Settings,
    path: "/settings",
  },
];

export function Sidebar() {
  return (
    <aside
      className="
        w-72
        border-r
        border-base-300
        bg-sidebar-bg
        p-6
        flex
        flex-col
        transition-colors
        duration-300
      "
    >
      {/* LOGO */}
      <h1
        className="
          text-4xl
          font-bold
          text-primary
          mb-2
        "
      >
        Smart Planner
      </h1>

      <p
        className="
          text-sm
          text-base-content/60
          mb-8
        "
      >
        Organize sua vida
      </p>

      {/* MENU */}
      <nav className="flex flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `
                flex
                items-center
                gap-4
                px-4
                py-4
                rounded-2xl
                transition-all
                text-base-content
                hover:bg-base-300
                hover:text-primary

                ${
                  isActive
                    ? "bg-primary text-primary-content shadow-lg"
                    : ""
                }
              `
              }
            >
              <Icon size={22} />

              <span className="text-lg">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}