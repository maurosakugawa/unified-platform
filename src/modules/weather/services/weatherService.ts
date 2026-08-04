const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  city: string;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
  condition: string; // Clear, Rain, Clouds, Snow, etc.
  isDay: boolean;
}

export interface ForecastItem {
  date: string;
  temp: number;
  description: string;
  icon: string;
  condition: string;
}

const cityAliases: Record<string, string> = {
  'moscou': 'Moscow',
  'genebra': 'Geneva',
  'londres': 'London',
  'tóquio': 'Tokyo',
  'são paulo': 'Sao Paulo',
  'rio de janeiro': 'Rio de Janeiro',
};

function normalizeCity(city: string): string {
  const lower = city.toLowerCase().trim();
  return cityAliases[lower] || city;
}

export async function fetchWeather(city: string): Promise<WeatherData> {
  const normalizedCity = normalizeCity(city);
  const url = `${BASE_URL}/weather?q=${encodeURIComponent(normalizedCity)}&appid=${API_KEY}&units=metric&lang=pt`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Cidade não encontrada');

  const data = await res.json();
  const isDay = data.weather[0].icon.endsWith('d');

  return {
    city: data.name,
    temp: Math.round(data.main.temp),
    feels_like: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    wind_speed: data.wind.speed,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    condition: data.weather[0].main,
    isDay,
  };
}

export async function fetchForecast(city: string): Promise<ForecastItem[]> {
  const normalizedCity = normalizeCity(city);
  const url = `${BASE_URL}/forecast?q=${encodeURIComponent(normalizedCity)}&appid=${API_KEY}&units=metric&lang=pt`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Cidade não encontrada');

  const data = await res.json();

  // Agrupar por dia (API retorna a cada 3h, pegar 1 por dia ao meio-dia)
  const daily: Record<string, any> = {};
  data.list.forEach((item: any) => {
    const date = item.dt_txt.split(' ')[0];
    const hour = parseInt(item.dt_txt.split(' ')[1].split(':')[0]);
    if (!daily[date] || Math.abs(hour - 12) < Math.abs(daily[date].hour - 12)) {
      daily[date] = { ...item, hour };
    }
  });

  return Object.values(daily).slice(0, 5).map((item: any) => ({
    date: item.dt_txt.split(' ')[0],
    temp: Math.round(item.main.temp),
    description: item.weather[0].description,
    icon: item.weather[0].icon,
    condition: item.weather[0].main,
  }));
}
