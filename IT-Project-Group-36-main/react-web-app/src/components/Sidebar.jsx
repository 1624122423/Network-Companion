// src/components/Sidebar.jsx
// -----------------------------------------
// Sidebar with brand "NC" logo and nav links
// - Brand links to /about
// - Uses NavLink for active state styling (class "active")
// -----------------------------------------
import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <nav className="side">
      {/*click to About */}
      <NavLink to="/about" className="brand">
      <span className="brand-name">NetworkCompanion</span>
      </NavLink>

      {/* Main nav */}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => `navlink ${isActive ? "active" : ""}`}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/calendar" className={({ isActive }) => `navlink ${isActive ? "active" : ""}`}>
            Calendar
          </NavLink>
        </li>
        <li>
          <NavLink to="/favorites" className={({ isActive }) => `navlink ${isActive ? "active" : ""}`}>
            Favorites
          </NavLink>
        </li>
        <li>
          <NavLink to="/bookings" className={({ isActive }) => `navlink ${isActive ? "active" : ""}`}>
            Bookings
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings" className={({ isActive }) => `navlink ${isActive ? "active" : ""}`}>
            Settings
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
