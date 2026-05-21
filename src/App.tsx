// src/App.tsx
/**
 * Main application routes
 *
 * @author Mauro Sakugawa
 * Date: 2026-05-21
 * License: MIT License
 * @version 1.0.0
 */
import { Routes, Route, Link } from 'react-router-dom'

import EventsPage from './modules/events/pages/EventsPage'

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
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/events"
        element={<EventsPage />}
      />
    </Routes>
  )
}