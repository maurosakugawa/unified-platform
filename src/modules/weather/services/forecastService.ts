// src/services/forecastService.tsS
import axios from "axios";
import type { ForecastData } from "../types/forecast";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export async function getForecastByCity(
  city: string
): Promise<ForecastData> {

    const response = axios.get(
        "https://api.openweathermap.org/data/2.5/forecast", 
        {
            params: {
                q: city,
                appid: API_KEY,
                units: "metric",
                lang: "pt_br",
        }
    });

    return (await response).data;
}
