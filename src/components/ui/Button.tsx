// src/components/ui/Button.tsx
/**
 * 
 * @author Mauro Sakugawa
 * Date: 2026-05-21
 * License: MIT License
 * @version 1.0.0
 */
import clsx from "clsx";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "btn rounded-xl px-6",
        {
          "btn-primary": variant === "primary",
          "btn-secondary": variant === "secondary",
          "btn-ghost": variant === "ghost",
        },
        className
      )}
      {...props}
    />
  );
}