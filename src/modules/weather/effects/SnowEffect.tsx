// src/components/effects/SnowEffect.tsx
export default function SnowEffect() {

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      {Array.from({ length: 80 }).map((_, i) => (

        <span
          key={i}
          className="
            absolute w-2 h-2 rounded-full
            bg-white/70
            animate-snow
          "
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
}