// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Calendar  from "./pages/Calendar.jsx";
import Bookings  from "./pages/Bookings.jsx";
import Favorites from "./pages/Favorites.jsx";
import Settings  from "./pages/Settings.jsx";
import About from "./pages/About.jsx";
import Auth from "./pages/Auth.jsx";
import SignUp from "./pages/SignUp.jsx";
import OnboardingMentor from "./pages/OnboardingMentor.jsx";




import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/about" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/calendar"  element={<Calendar />} />
      <Route path="/bookings"  element={<Bookings />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/settings"  element={<Settings />} />
      <Route path="/about" element={<About />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/signup" element = {<SignUp/>} />
       <Route path="/onboarding/mentor" element={<OnboardingMentor />} />
    </Routes>
  );
}
