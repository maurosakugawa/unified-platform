// src/themes/weatherEffects.types.ts
export interface WeatherAnimation {
  background: string;
  card: string;
  icon: string;
}

export interface WeatherParticleConfig {
  type:
    | "rain"
    | "snow"
    | "clouds"
    | "lightning"
    | "aurora"
    | "none";

  density: number;
  speed: number;
  opacity: number;
}

export interface WeatherBackground {
  overlay: string;
  blend: string;
}

export interface ResolvedWeatherTheme {
  theme: any;

  animation: WeatherAnimation;

  particle: WeatherParticleConfig;

  background: WeatherBackground;

  icon: any;
}