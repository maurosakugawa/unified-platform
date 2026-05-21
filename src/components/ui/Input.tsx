// src/components/ui/input.tsx
/**
 * 
 * @author Mauro Sakugawa
 * Date: 2026-05-21
 * License: MIT License
 * @version 1.0.0
 */
interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Input(props: InputProps) {
  return (
    <input
      {...props}
      className="
        input
        input-bordered
        w-full
        rounded-xl
        bg-white
      "
    />
  );
}