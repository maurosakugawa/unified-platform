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
