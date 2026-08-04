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
