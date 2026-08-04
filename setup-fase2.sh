#!/bin/bash
# =============================================================================
# SETUP FASE 2 — Módulo Weather
# =============================================================================
# Copia o Weather App como módulo, adapta caminhos, integra ao Smart Planner
# =============================================================================

set -e

echo "🌤️  FASE 2 — Módulo Weather"
echo "============================="
echo ""

cd ~/Sites/github/01-PI-planner/unified-platform

WEATHER_SRC="../weather-planner-app/src"
WEATHER_DST="src/modules/weather"

# -----------------------------------------------------------------------------
# 1. COPIAR CÓDIGO DO WEATHER APP
# -----------------------------------------------------------------------------
echo "📦 1. Copiando código do Weather App..."

if [ -d "../weather-planner-app" ]; then
    # Copiar serviços
    if [ -d "$WEATHER_SRC/services" ]; then
        cp -r "$WEATHER_SRC/services/"* "$WEATHER_DST/services/" 2>/dev/null || true
        echo "   ✅ services/ copiado"
    fi

    # Copiar themes
    if [ -d "$WEATHER_SRC/themes" ]; then
        cp -r "$WEATHER_SRC/themes/"* "$WEATHER_DST/themes/" 2>/dev/null || true
        echo "   ✅ themes/ copiado"
    fi

    # Copiar effects (pode estar em components/effects ou effects/)
    if [ -d "$WEATHER_SRC/components/effects" ]; then
        cp -r "$WEATHER_SRC/components/effects/"* "$WEATHER_DST/effects/" 2>/dev/null || true
        echo "   ✅ effects/ copiado (de components/effects)"
    elif [ -d "$WEATHER_SRC/effects" ]; then
        cp -r "$WEATHER_SRC/effects/"* "$WEATHER_DST/effects/" 2>/dev/null || true
        echo "   ✅ effects/ copiado"
    fi

    # Copiar types
    if [ -d "$WEATHER_SRC/types" ]; then
        cp -r "$WEATHER_SRC/types/"* "$WEATHER_DST/types/" 2>/dev/null || true
        echo "   ✅ types/ copiado"
    fi

    # Copiar utils se existir
    if [ -d "$WEATHER_SRC/utils" ]; then
        cp -r "$WEATHER_SRC/utils/"* "$WEATHER_DST/utils/" 2>/dev/null || true
        echo "   ✅ utils/ copiado"
    fi
else
    echo "   ⚠️  weather-planner-app não encontrado. Criando do zero..."
fi

echo ""

# -----------------------------------------------------------------------------
# 2. CRIAR WEATHER SERVICE (se não foi copiado ou como fallback)
# -----------------------------------------------------------------------------
echo "📦 2. Garantindo weatherService.ts..."

mkdir -p "$WEATHER_DST/services"

cat > "$WEATHER_DST/services/weatherService.ts" << 'EOFSVC'
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
EOFSVC

echo "   ✅ weatherService.ts criado"

# -----------------------------------------------------------------------------
# 3. CRIAR TEMAS E VISUAL ENGINE (se não foram copiados)
# -----------------------------------------------------------------------------
echo "📦 3. Garantindo temas e visual engine..."

mkdir -p "$WEATHER_DST/themes"

cat > "$WEATHER_DST/themes/weatherTheme.ts" << 'EOFTHEME'
export interface WeatherTheme {
  bgGradient: string;
  textColor: string;
  cardBg: string;
  accentColor: string;
  particleType: 'none' | 'rain' | 'snow' | 'clouds';
}

export function getWeatherTheme(condition: string, isDay: boolean): WeatherTheme {
  const themes: Record<string, WeatherTheme> = {
    Clear: {
      bgGradient: isDay 
        ? 'from-amber-400 via-orange-300 to-yellow-200'
        : 'from-slate-900 via-indigo-900 to-purple-900',
      textColor: isDay ? 'text-slate-800' : 'text-white',
      cardBg: isDay ? 'bg-white/30' : 'bg-white/10',
      accentColor: isDay ? 'amber-500' : 'indigo-400',
      particleType: 'none',
    },
    Rain: {
      bgGradient: 'from-slate-700 via-slate-600 to-slate-500',
      textColor: 'text-white',
      cardBg: 'bg-white/10',
      accentColor: 'blue-400',
      particleType: 'rain',
    },
    Drizzle: {
      bgGradient: 'from-slate-600 via-slate-500 to-slate-400',
      textColor: 'text-white',
      cardBg: 'bg-white/10',
      accentColor: 'blue-300',
      particleType: 'rain',
    },
    Clouds: {
      bgGradient: isDay
        ? 'from-gray-300 via-gray-200 to-slate-300'
        : 'from-slate-800 via-gray-800 to-slate-700',
      textColor: isDay ? 'text-slate-800' : 'text-white',
      cardBg: isDay ? 'bg-white/40' : 'bg-white/10',
      accentColor: 'gray-400',
      particleType: 'clouds',
    },
    Snow: {
      bgGradient: 'from-blue-100 via-white to-blue-50',
      textColor: 'text-slate-800',
      cardBg: 'bg-white/50',
      accentColor: 'blue-300',
      particleType: 'snow',
    },
    Thunderstorm: {
      bgGradient: 'from-slate-900 via-purple-900 to-slate-800',
      textColor: 'text-white',
      cardBg: 'bg-white/10',
      accentColor: 'purple-400',
      particleType: 'rain',
    },
  };

  return themes[condition] || themes.Clear;
}
EOFTHEME

echo "   ✅ weatherTheme.ts criado"

# -----------------------------------------------------------------------------
# 4. CRIAR COMPONENTES DE EFEITOS (CSS simples, sem canvas pesado)
# -----------------------------------------------------------------------------
echo "📦 4. Criando efeitos visuais..."

mkdir -p "$WEATHER_DST/effects"

cat > "$WEATHER_DST/effects/WeatherEffects.tsx" << 'EOFEFF'
import { useEffect, useRef } from 'react';

interface Props {
  type: 'none' | 'rain' | 'snow' | 'clouds';
}

export default function WeatherEffects({ type }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (type === 'none') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{ x: number; y: number; speed: number; size: number }> = [];
    const count = type === 'rain' ? 200 : type === 'snow' ? 100 : 50;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: type === 'rain' ? 5 + Math.random() * 10 : 0.5 + Math.random() * 2,
        size: type === 'rain' ? 1 : 2 + Math.random() * 3,
      });
    }

    let animId: number;

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        ctx.beginPath();
        if (type === 'rain') {
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y + 15);
          ctx.stroke();
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        p.y += p.speed;
        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
      });

      animId = requestAnimationFrame(animate);
    }

    animate();

    return () => cancelAnimationFrame(animId);
  }, [type]);

  if (type === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  );
}
EOFEFF

echo "   ✅ WeatherEffects.tsx criado"

# -----------------------------------------------------------------------------
# 5. CRIAR COMPONENTES DA PÁGINA
# -----------------------------------------------------------------------------
echo "📦 5. Criando componentes da página..."

mkdir -p "$WEATHER_DST/components"

cat > "$WEATHER_DST/components/CitySearch.tsx" << 'EOFCOMP'
import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

interface Props {
  onSearch: (city: string) => void;
  loading: boolean;
}

export default function CitySearch({ onSearch, loading }: Props) {
  const [city, setCity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) onSearch(city.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
      <div className="relative flex-1">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Digite uma cidade..."
          className="input input-bordered w-full pl-10"
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? <span className="loading loading-spinner" /> : <Search className="w-5 h-5" />}
      </button>
    </form>
  );
}
EOFCOMP

cat > "$WEATHER_DST/components/WeatherCard.tsx" << 'EOFCOMP'
import { Droplets, Wind, Thermometer, Sun, Moon } from 'lucide-react';
import type { WeatherData } from '../services/weatherService';

interface Props {
  data: WeatherData;
}

export default function WeatherCard({ data }: Props) {
  const iconUrl = `https://openweathermap.org/img/wn/${data.icon}@4x.png`;

  return (
    <div className="card bg-base-100/80 backdrop-blur shadow-xl">
      <div className="card-body items-center text-center">
        <h2 className="card-title text-3xl flex items-center gap-2">
          {data.isDay ? <Sun className="w-8 h-8 text-amber-500" /> : <Moon className="w-8 h-8 text-indigo-400" />}
          {data.city}
        </h2>

        <div className="flex items-center gap-4 my-4">
          <img src={iconUrl} alt={data.description} className="w-24 h-24" />
          <div>
            <p className="text-6xl font-bold">{data.temp}°</p>
            <p className="text-lg capitalize">{data.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full">
          <div className="flex flex-col items-center p-3 rounded-lg bg-base-200/50">
            <Thermometer className="w-5 h-5 mb-1" />
            <span className="text-sm text-gray-500">Sensação</span>
            <span className="font-semibold">{data.feels_like}°</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-base-200/50">
            <Droplets className="w-5 h-5 mb-1" />
            <span className="text-sm text-gray-500">Umidade</span>
            <span className="font-semibold">{data.humidity}%</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-base-200/50">
            <Wind className="w-5 h-5 mb-1" />
            <span className="text-sm text-gray-500">Vento</span>
            <span className="font-semibold">{data.wind_speed} m/s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
EOFCOMP

cat > "$WEATHER_DST/components/ForecastCard.tsx" << 'EOFCOMP'
import { Calendar } from 'lucide-react';
import type { ForecastItem } from '../services/weatherService';

interface Props {
  forecast: ForecastItem[];
}

export default function ForecastCard({ forecast }: Props) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div className="card bg-base-100/80 backdrop-blur shadow-xl">
      <div className="card-body">
        <h3 className="card-title flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Previsão 5 Dias
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
          {forecast.map((day, i) => (
            <div key={i} className="flex flex-col items-center p-3 rounded-lg bg-base-200/50">
              <span className="text-sm text-gray-500">{formatDate(day.date)}</span>
              <img 
                src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`} 
                alt={day.description}
                className="w-12 h-12"
              />
              <span className="text-xl font-bold">{day.temp}°</span>
              <span className="text-xs capitalize text-center">{day.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
EOFCOMP

echo "   ✅ Components criados"

# -----------------------------------------------------------------------------
# 6. CRIAR WEATHERPAGE
# -----------------------------------------------------------------------------
echo "📦 6. Criando WeatherPage..."

cat > "$WEATHER_DST/pages/WeatherPage.tsx" << 'EOFPAGE'
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
EOFPAGE

echo "   ✅ WeatherPage.tsx criado"

# -----------------------------------------------------------------------------
# 7. ADICIONAR VARIÁVEL DE AMBIENTE (se não existir)
# -----------------------------------------------------------------------------
echo "📦 7. Verificando variável de ambiente OpenWeather..."

if [ ! -f ".env" ] || ! grep -q "VITE_OPENWEATHER_API_KEY" .env 2>/dev/null; then
    echo "VITE_OPENWEATHER_API_KEY=sua_chave_aqui" >> .env
    echo "   ✅ Adicionado VITE_OPENWEATHER_API_KEY ao .env"
    echo "   ⚠️  Lembre-se de substituir 'sua_chave_aqui' pela sua chave real!"
    echo "      Obtenha em: https://openweathermap.org/api"
else
    echo "   ✅ VITE_OPENWEATHER_API_KEY já existe"
fi

echo ""

# -----------------------------------------------------------------------------
# 8. INSTRUÇÕES MANUAIS (rotas e sidebar)
# -----------------------------------------------------------------------------
echo "=============================="
echo "📋 INSTRUÇÕES MANUAIS NECESSÁRIAS"
echo "=============================="
echo ""
echo "O script não pode editar automaticamente os arquivos existentes do Smart Planner."
echo "Você precisa adicionar manualmente:"
echo ""
echo "1️⃣  ADICIONAR ROTA /weather"
echo "   Edite: src/routes/AppRoutes.tsx (ou src/App.tsx)"
echo "   Adicione:"
echo ""
echo "   import WeatherPage from '../modules/weather/pages/WeatherPage';"
echo ""
echo "   <Route path="/weather" element={<WeatherPage />} />"
echo ""
echo "2️⃣  ADICIONAR ITEM NA SIDEBAR"
echo "   Edite: src/layouts/Sidebar.tsx (ou componente de navegação)"
echo "   Adicione um link:"
echo ""
echo "   import { Cloud } from 'lucide-react';"
echo ""
echo "   <Link to="/weather" className="...">"
echo "     <Cloud className="w-5 h-5" />"
echo "     <span>Clima</span>"
echo "   </Link>"
echo ""
echo "=============================="
echo "✅ FASE 2 — Código gerado!"
echo "=============================="
echo ""
echo "Arquivos criados em: $WEATHER_DST"
find "$WEATHER_DST" -type f | sort
echo ""
echo "Próximos passos:"
echo "  1. Edite src/routes/AppRoutes.tsx para adicionar /weather"
echo "  2. Edite src/layouts/Sidebar.tsx para adicionar link 'Clima'"
echo "  3. Adicione sua VITE_OPENWEATHER_API_KEY no .env"
echo "  4. npm run dev (na raiz) para testar"
echo "  5. git add . && git commit -m 'fase-2: modulo weather integrado'"
echo "  6. git push origin main"
