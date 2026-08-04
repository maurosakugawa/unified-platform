// src/components/effects/RainEffect.tsx
export default function RainEffect() {

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      {Array.from({ length: 120 }).map((_, i) => (

        <span
          key={i}
          className="
            absolute w-[1px] h-6
            bg-white/30
            animate-rain
          "
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}