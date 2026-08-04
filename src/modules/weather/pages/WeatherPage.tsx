import { useState, useCallback } from 'react';
import { Cloud } from 'lucide-react';
import CitySearch from '../components/CitySearch';
import WeatherCard from '../components/WeatherCard';
import ForecastCard from '../components/ForecastCard';
import WeatherEffects from '../effects/WeatherEffects';
import { fetchWeather, fetchForecast } from '../services/weatherService';
import { getWeatherTheme } from '../themes/weatherTheme';
import type { WeatherData, ForecastItem } from '../services/weatherService';

export default function WeatherPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = useCallback(async (city: string) => {
    setLoading(true);
    setError('');
    try {
      const [wData, fData] = await Promise.all([
        fetchWeather(city),
        fetchForecast(city),
      ]);
      setWeather(wData);
      setForecast(fData);
    } catch (err) {
      setError('Cidade não encontrada. Tente novamente.');
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const theme = weather ? getWeatherTheme(weather.condition, weather.isDay) : null;

  return (
    <div className={`relative min-h-screen transition-all duration-700 ${
      theme ? `bg-gradient-to-br ${theme.bgGradient}` : 'bg-gradient-to-br from-blue-400 to-blue-600'
    }`}>

      {weather && <WeatherEffects type={theme?.particleType || 'none'} />}

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Cloud className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Clima</h1>
        </div>

        <div className="flex justify-center mb-8">
          <CitySearch onSearch={handleSearch} loading={loading} />
        </div>

        {error && (
          <div className="alert alert-error max-w-md mx-auto mb-6">
            <span>{error}</span>
          </div>
        )}

        {weather && (
          <div className="grid gap-6 max-w-4xl mx-auto">
            <WeatherCard data={weather} />
            <ForecastCard forecast={forecast} />
          </div>
        )}

        {!weather && !loading && !error && (
          <div className="text-center mt-20 opacity-70">
            <Cloud className="w-20 h-20 mx-auto mb-4" />
            <p className="text-xl">Busque uma cidade para ver o clima</p>
          </div>
        )}
      </div>
    </div>
  );
}
