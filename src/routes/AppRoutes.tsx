// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import EventsPage from "../modules/events/pages/EventsPage";
import CalendarPage from "../modules/calendar/pages/CalendarPage";
import WeatherPage from '../modules/weather/pages/WeatherPage';
import ContactsPage from '../modules/contacts/pages/ContactsPage';
import LoginPage from '../pages/LoginPage';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Páginas do Smart Planner (estrutura própria, sem MainLayout) */}
      <Route path="/" element={
        <ProtectedRoute><EventsPage /></ProtectedRoute>
      } />
      <Route path="/events" element={
        <ProtectedRoute><EventsPage /></ProtectedRoute>
      } />
      <Route path="/calendar" element={
        <ProtectedRoute><CalendarPage /></ProtectedRoute>
      } />

      {/* Páginas novas (com MainLayout + sidebar) */}
      <Route path="/weather" element={
        <ProtectedRoute>
          <MainLayout title="Clima" subtitle="Previsão do tempo">
            <WeatherPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/contacts" element={
        <ProtectedRoute>
          <MainLayout title="Contatos" subtitle="Gerencie seus contatos">
            <ContactsPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
