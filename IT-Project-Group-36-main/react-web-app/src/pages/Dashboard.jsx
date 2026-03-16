import "../pages/Dashboard.css";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar.jsx";
import MentorCard from "../components/MentorCard.jsx";
import ReminderPanel from "../components/ReminderPanel.jsx";
import BookingModal from "../components/BookingModal.jsx";
import { getMentors } from "../api.js"; // API placeholder

import SignInRequired, { getSignedInUser } from "../components/SignInRequired.jsx";


export default function Dashboard() {

  const user = getSignedInUser();

  // Unified early-return when not signed in
  if (!user) {
    return (
      <SignInRequired
        title="Dashboard"
        message="You need to sign in to browse mentors and book sessions."
      />
    );
  }
  const [selected, setSelected] = useState(null);

  // ---- Keep your mock mentors (used as fallback only) ----
  const MOCK_MENTORS = [
    {
      id: 1,
      name: "Desmond Foo",
      position: "API Alchemist",
      experienceYears: 9,
      bio: "Turns legacy endpoints into elegant APIs and transmutes messy payloads into clean JSON.",
    },
    {
      id: 2,
      name: "Otto",
      position: "Pro Cuddler",
      experienceYears: 7,
      bio: "Certified morale booster—expert in warm hugs, good vibes, and team support.",
    },
    {
      id: 3,
      name: "Josh Wang",
      position: "Driver",
      experienceYears: 20,
      bio: "Keeps releases on the road and deadlines on time—drives sprints from kickoff to delivery.",
    },
    {
      id: 4,
      name: "Liam Yang",
      position: "NBA Player",
      experienceYears: 5,
      bio: "Full-court vision for system design; rebounds from failures and leads fast breaks in projects.",
    },
  ];

  // ---- Reminder mock stays the same ----
  const MOCK_REMINDERS = [
    {
      id: 1,
      date: "Sep 25",
      time: "10:00",
      with: "Desmond Foo",
      location: "Melbourne CBD",
    },
    {
      id: 2,
      date: "Sep 26",
      time: "14:00",
      with: "Jason Cao",
      location: "Carlton",
    },
  ];

  // ---- States for API data ----
  const [mentors, setMentors] = useState(MOCK_MENTORS);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // ---- API fetch with mock fallback ----
  const loadMentors = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await getMentors({ page: 1, page_size: 20 });
      console.log(data)
      const items = Array.isArray(data) ? data : data.items || [];
      setMentors(items);
    } catch (e) {
      console.warn("getMentors failed → using mock mentors:", e?.message);
      setMentors(MOCK_MENTORS);
      setErr(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMentors();
  }, [loadMentors]);

  return (
    <div className="dashboard">
      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main content area */}
      <main>
        <h2>Find your mentor</h2>

        {/* Search bar UI (not connected yet) */}
        <div className="search-bar">
          <input placeholder="Enter Name" />
          <input placeholder="Select Category" />
          <input placeholder="Enter Suburb or Region" />
        </div>

        <h2>Recommended Mentors</h2>

        {/* Loading / error state */}
        {loading && <div>Loading mentors…</div>}
        {!loading && err && (
          <div style={{ color: "#888", marginTop: 8 }}>
            Using mock data (API not ready).
          </div>
        )}

        {/* Mentor grid */}
        <div className="grid">
          {mentors.map((m) => (
            <MentorCard key={m.id} mentor={m} onOpen={setSelected} />
          ))}
        </div>
      </main>

      
          
      {/* Modal panel for profile and booking */}
      <BookingModal mentor={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
