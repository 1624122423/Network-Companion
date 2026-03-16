import { useEffect, useState, useCallback } from "react";
import { getUserAppointments } from "../api";

// Reminder panel now tries API first, fallback to mock
export default function ReminderPanel({ reminders: mockReminders }) {
  const [appointments, setAppointments] = useState(mockReminders || []);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // Try to fetch from backend first
  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await getUserAppointments();
      const items = Array.isArray(data) ? data : data.items || [];
      setAppointments(items);
    } catch (e) {
      console.warn("getUserAppointments failed → using mock reminders:", e?.message);
      setAppointments(mockReminders || []);
      setErr(e);
    } finally {
      setLoading(false);
    }
  }, [mockReminders]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  return (
    <div className="reminder-panel">
      <h3>Upcoming Events</h3>

      {loading && <div>Loading appointments...</div>}
      {!loading && err && (
        <div style={{ color: "#888", marginBottom: 8 }}>
          Showing mock bookings (API not ready).
        </div>
      )}

      {appointments.map((a) => (
        <div key={a.id} className="reminder-item">
          <strong>{a.with || a.mentor_name}</strong>
          <br />
          {a.date} {a.time && `· ${a.time}`} {a.location && `· ${a.location}`}
        </div>
      ))}
    </div>
  );
}
