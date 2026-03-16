import { useEffect, useState } from "react";
import { getMentorById, createAppointment} from "../api.js";

export default function ProfileModal({ mentor, onClose }) {
  if (!mentor) return null;

  const [week, setWeek] = useState([]);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null); // selected slot object
  const activeDay = week[activeDayIdx];

  // Fetch mentor availability on mount or when mentor changes
  useEffect(() => {
    if (!mentor?.mentor_id) return;

    const fetchAvailability = async () => {
      try {
        console.log("Fetching mentor availability:", mentor.mentor_id);
        const json = await getMentorById(mentor.mentor_id);

        if (json && Array.isArray(json.available_time)) {
          const grouped = {};

          // Group available_time by weekday
          json.available_time.forEach(slot => {
            const start = new Date(slot.start_time);
            const end = new Date(slot.end_time);
            const day = start.toLocaleDateString("en-AU", { weekday: "short" });
            console.log(slot)

            const startStr = start.toLocaleTimeString("en-AU", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
            const endStr = end.toLocaleTimeString("en-AU", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });

            const slotLabel = `${startStr}-${endStr}`;

            if (!grouped[day]) grouped[day] = [];
            grouped[day].push({
              id: slot.appointment_id, // ensure the backend provides an ID
              label: slotLabel,
              start_time: slot.start_time,
              end_time: slot.end_time,
            });
          });

          const orderedDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          const formattedWeek = orderedDays.map(day => ({
            day,
            slots: grouped[day] || [],
          }));

          setWeek(formattedWeek);
          setActiveDayIdx(formattedWeek.findIndex(d => d.slots.length > 0) || 0);
        }
      } catch (err) {
        console.error("Failed to fetch mentor availability:", err);
      } finally {
        setSelectedSlot(null);
      }
    };

    fetchAvailability();
  }, [mentor]);

  // Handle booking
  const handleConfirm = async () => {
    if (!selectedSlot) return;
    try {
      console.log("Booking slot:", selectedSlot);
      await createAppointment({
        appointmentId: selectedSlot.id,  // ✅ Send appointment ID
      });

      alert(
        `Booked: ${mentor.name} • ${activeDay.day} • ${selectedSlot.label}`
      );
      onClose();
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Failed to book appointment. Please try again later.");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bm-header">
          <button className="bm-back" onClick={onClose}>← Back</button>
          <div className="bm-title">
            <div className="bm-h1">Book Mentor</div>
            <div className="bm-mentor">
              <div className="bm-name">{mentor.name}</div>
              <div className="bm-sub">{mentor.position || "Mentor"}</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="bm-body">
          {/* Left: time selection */}
          <div className="bm-left">
            <div className="bm-section-title">Select a time</div>

            {/* Day tabs */}
            <div className="bm-days">
              {week.map((d, i) => (
                <button
                  key={d.day}
                  className={`bm-day ${i === activeDayIdx ? "active" : ""}`}
                  onClick={() => {
                    setActiveDayIdx(i);
                    setSelectedSlot(null);
                  }}
                >
                  {d.day}
                </button>
              ))}
            </div>

            {/* Slots */}
            <div className="bm-slot-grid">
              {activeDay?.slots?.length ? (
                activeDay.slots.map((s) => (
                  <button
                    key={s.id}
                    className={`bm-slot ${selectedSlot?.id === s.id ? "selected" : ""}`}
                    onClick={() => setSelectedSlot(s)}
                  >
                    {s.label}
                  </button>
                ))
              ) : (
                <div className="bm-empty">No available slots for this day.</div>
              )}
            </div>

            {/* Selected summary */}
            <div className="bm-selected">
              {selectedSlot
                ? <>You have selected: <strong>{activeDay.day}, {selectedSlot.label}</strong></>
                : <>Please select a time slot.</>}
            </div>

            {/* Actions */}
            <div className="bm-actions">
              <button className="bm-cancel" onClick={onClose}>Cancel</button>
              <button
                className="bm-confirm"
                disabled={!selectedSlot}
                onClick={handleConfirm}
              >
                Confirm Booking
              </button>
            </div>
          </div>

          {/* Right: optional sidebar */}
          <div className="bm-right">
            <div className="bm-right-title">Upcoming Meetings</div>
            {/* Replace with dynamic data later */}
            <div className="bm-right-card">
              <div className="bm-right-day">Mon 8 September</div>
              <div className="bm-right-item">Bill Gates 12:00–13:00</div>
              <div className="bm-right-meta">UniMelb Library</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
