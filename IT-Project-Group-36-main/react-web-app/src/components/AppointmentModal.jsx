import React, { useState } from "react";
import { createTimeSlots } from "../api.js";

// helper to convert a Date to Melbourne ISO string (local time preserved)
function toMelbourneISO(date) {
  const melbourneFormatter = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Melbourne",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = melbourneFormatter.formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t)?.value;
  const y = get("year");
  const m = get("month");
  const d = get("day");
  const h = get("hour");
  const min = get("minute");
  const s = get("second");

  // Format manually as ISO-like string (local time, not UTC)
  return `${y}-${m}-${d}T${h}:${min}:${s}`;
}

export default function AppointmentButton() {
  const [showModal, setShowModal] = useState(false);
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (start.toDateString() !== end.toDateString()) {
      alert("Start time and end time must be on the same date.");
      return;
    }

    if (end <= start) {
      alert("End time must be after start time.");
      return;
    }

    // ✅ Convert to Melbourne local time before sending
    const melbourneStart = toMelbourneISO(start);
    const melbourneEnd = toMelbourneISO(end);

    try {
      const res = await createTimeSlots({
        start_time: melbourneStart,
        end_time: melbourneEnd,
        location,
      });

      if (res?.ok) {
        alert("Appointment created successfully!");
      } else {
        console.error("Failed response:", res);
        alert("Failed to create appointment. Please try again.");
      }
    } catch (err) {
      console.error("Error creating appointment:", err);
      alert("Something went wrong while creating the appointment.");
    }

    setShowModal(false);
  };

  const handleStartChange = (e) => {
    const newStart = e.target.value;
    setStartDateTime(newStart);

    // force end date to same date if it crosses over
    if (endDateTime && new Date(newStart).toDateString() !== new Date(endDateTime).toDateString()) {
      const sameDate = new Date(newStart);
      sameDate.setHours(23, 59);
      setEndDateTime(sameDate.toISOString().slice(0, 16));
    }
  };

  return (
    <>
      <button
        className="cal-btn strong"
        style={{
          backgroundColor: "#2563eb",
          color: "white",
          borderRadius: "8px",
          padding: "8px 16px",
        }}
        onClick={() => setShowModal(true)}
      >
        + Make Appointment
      </button>

      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              width: "400px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
          >
            <h2 style={{ marginBottom: "16px" }}>New Appointment</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ textAlign: "left" }}>
                Start Time:
                <input
                  type="datetime-local"
                  value={startDateTime}
                  onChange={handleStartChange}
                  required
                  style={{ width: "100%", padding: "6px", marginTop: "4px" }}
                />
              </label>

              <label style={{ textAlign: "left" }}>
                End Time:
                <input
                  type="datetime-local"
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                  required
                  style={{ width: "100%", padding: "6px", marginTop: "4px" }}
                  min={startDateTime}
                />
              </label>

              <label style={{ textAlign: "left" }}>
                Location:
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter location"
                  required
                  style={{ width: "100%", padding: "6px", marginTop: "4px" }}
                />
              </label>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    backgroundColor: "#e5e7eb",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#2563eb",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
