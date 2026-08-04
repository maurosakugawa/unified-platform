// src/themes/weatherThemeResolver.ts

import { getWeatherTheme } from "./weatherTheme";
import { weatherIcons } from "./weatherIcons";
import { weatherAnimations } from "./weatherAnimations";
import { weatherParticles } from "./weatherParticles";
import { weatherBackgrounds } from "./weatherBackgrounds";

import type { WeatherType } from "./weather.types";

function normalizeWeather(
  weather?: string
): WeatherType {

  const normalized =
    weather?.toLowerCase();

  switch (normalized) {

    case "clear":
    case "clouds":
    case "rain":
    case "drizzle":
    case "thunderstorm":
    case "snow":
      return normalized;

    default:
      return "default";
  }
}

export function resolveWeatherTheme(
  weather?: string,
  isNight?: boolean
) {

  const normalized =
    normalizeWeather(weather);

  return {

    theme:
      getWeatherTheme(
        normalized,
        isNight
      ),

    animation:
      weatherAnimations[normalized],

    icon:
      weatherIcons[
        normalized as keyof typeof weatherIcons
      ],

    particle:
      weatherParticles[normalized],

    background:
      weatherBackgrounds[normalized],
  };
}