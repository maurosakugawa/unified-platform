// src/components/ui/Card.tsx
/**
 * 
 * @author Mauro Sakugawa
 * Date: 2026-05-21
 * License: MIT License
 * @version 1.0.0
 */
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={`
        bg-white
        rounded-3xl
        shadow-sm
        border
        border-gray-100
        p-6
        ${className}
      `}
    >
      {children}
    </div>
  );
}