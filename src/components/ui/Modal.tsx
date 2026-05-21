// src/components/ui/Modal.tsx
/**
 * 
 * @author Mauro Sakugawa
 * @created 2026-05-21
 * @license MIT License
 * @version 1.0.0
 */
import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/40
        backdrop-blur-sm
        p-4
      "
    >
      <div
        className="
          bg-white
          rounded-3xl
          shadow-2xl
          w-full
          max-w-2xl
          animate-in
          fade-in
          zoom-in-95
          duration-200
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            px-6
            py-5
            border-b
            border-slate-100
          "
        >
          <h2
            className="
              text-xl
              font-bold
              text-slate-800
            "
          >
            {title}
          </h2>

          <button
            onClick={onClose}
            className="
              btn
              btn-sm
              btn-circle
              btn-ghost
            "
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}