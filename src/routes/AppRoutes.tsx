// src/routes/AppRoutes.tsx

import {
  Routes,
  Route,
  Link,
} from "react-router-dom";

import EventsPage
  from "../modules/events/pages/EventsPage";

import CalendarPage
  from "../modules/calendar/pages/CalendarPage";

import WeatherPage from '../modules/weather/pages/WeatherPage';

function Home() {
  return (
    <div className="p-4">
      <Link
        to="/events"
        className="btn btn-primary"
      >
        Smart Planner
      </Link>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/events"
        element={<EventsPage />}
      />

      <Route
        path="/calendar"
        element={<CalendarPage />}
      />

      <Route 
        path="/weather" 
        element={<WeatherPage />} 
      />
    </Routes>
  );
}