// src/pages/Calendar.jsx
// ------------------------------------------------------
// Week-view calendar (Sidebar + board)
// - API-first (getUserAppointments), mock fallback
// - Click event -> details dialog -> confirm cancel
// - Uses styles from ./Calendar.css (cal-* classes)
// ------------------------------------------------------

import React, { useMemo, useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { getTimeSlots, getUserAppointments, cancelAppointment as apiCancel } from "../api";
import "./Calendar.css";
import AppointmentButton from "../components/AppointmentModal.jsx";

import { loadAppointments, saveAppointments } from "../mocks/appointments";

import SignInRequired, { getSignedInUser } from "../components/SignInRequired.jsx";


// -- date helpers (Mon first)
function startOfWeek(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (x.getDay() + 6) % 7; // Mon=0..Sun=6
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const monthLabel = (d) => d.toLocaleString(undefined, { month: "long" });
const dayHeaderLabel = (d) => `${d.toLocaleString(undefined, { weekday: "short" })} ${d.getDate()}`;

// -- time axis
const START_HOUR = 0;
const END_HOUR = 23;
const ROW_HEIGHT = 60; // px per hour row
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
const hourLabel = (h) => (h === 0 ? "12 AM" : h === 12 ? "12 PM" : h < 12 ? `${h} AM` : `${h - 12} PM`);

// -- mock fallback (spread across the week)
const MOCK_EVENTS = [
  { appointment_id: "m1", mentor_name: "Desmond Foo", location: "Melbourne CBD", start: "2025-10-13T10:00:00", end: "2025-10-13T11:00:00", durationMin: 60 },
  { appointment_id: "m2", mentor_name: "Jason Cao", location: "Carlton", start: "2025-10-14T14:30:00", end: "2025-10-14T15:15:00", durationMin: 45 },
  { appointment_id: "m3", mentor_name: "Liam Yang", location: "Docklands", start: "2025-10-15T09:00:00", end: "2025-10-15T09:45:00", durationMin: 45 },
  { appointment_id: "m4", mentor_name: "Kee Keit Foo", location: "Richmond", start: "2025-10-15T16:00:00", end: "2025-10-15T17:00:00", durationMin: 60 },
  { appointment_id: "m5", mentor_name: "Desmond Foo", location: "Melbourne CBD", start: "2025-10-16T11:15:00", end: "2025-10-16T12:00:00", durationMin: 45 },
  { appointment_id: "m6", mentor_name: "Jason Cao", location: "Carlton", start: "2025-10-17T13:00:00", end: "2025-10-17T13:30:00", durationMin: 30 },
];

// -- grid helpers
const getDayIndex = (weekStart, date) =>
  Math.floor((new Date(date).setHours(0, 0, 0, 0) - weekStart.getTime()) / 86400000);
const timeToRow = (h, m) => (h - START_HOUR) + m / 60;

// Helper: parse ISO string and interpret it as Melbourne local time
function parseMelbourneTime(isoString) {
  if (!isoString) return new Date();

  // Create a Date object in UTC, then format to Melbourne time zone
  const utcDate = new Date(isoString);

  // Use Intl to convert to "Australia/Melbourne" time
  const melbourneString = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Melbourne",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(utcDate);

  // melbourneString → "20/10/2025, 19:45:50" format
  const [datePart, timePart] = melbourneString.split(", ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute, second);
}

function normalizeAppointments(list = []) {
  return list.map((raw, i) => {
    const s = raw.start_time || raw.startTime || raw.start || raw.begin;
    const e = raw.end_time || raw.endTime || raw.end || raw.finish;

    // Interpret both as Melbourne local time
    const ds = parseMelbourneTime(s);
    const de = e ? parseMelbourneTime(e) : new Date(ds.getTime() + 60 * 60000);

    const mentor_name = raw.mentor?.name || raw.mentor_name || raw.mentor || "";
    const location = raw.location || raw.where || "";
    const status = raw.status;

    return {
      appointment_id: raw.appointment_id ?? `apt-${i}`,
      mentor_name: mentor_name || "",
      location,
      start: ds.toISOString(), // still store ISO, but derived from Melbourne local time
      end: de.toISOString(),
      status,
      durationMin: Math.max(15, Math.round((de - ds) / 60000)),

      // Display label — locked to Melbourne time
      labelTime: new Intl.DateTimeFormat("en-AU", {
        timeZone: "Australia/Melbourne",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(ds),
    };
  });
}


// -- main page
export default function Calendar() {

  const user = getSignedInUser();

  if (!user) {
    return (
      <SignInRequired
        title="Calendar"
        message="You need to sign in to view your calendar and manage bookings."
        wrapClass="cal-page" // 保持你的日历主容器 class
      />
    );
  }
  
  const DEMO_USER_ID = 1; // TODO: replace with real user id from auth

  const [anchor, setAnchor] = useState(startOfWeek(new Date()));
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const scrollRef = useRef(null);


  // -- visible week days
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(anchor, i)),
    [anchor]
  );

// -- load appointments (API-first)


useEffect(() => {
  let active = true;
  (async () => {
    try {
      // 1) server-first
      const res = normalizeAppointments(await getUserAppointments()) 

      if (!active) return;
      setEvents(res);

      const res2 = normalizeAppointments(await getTimeSlots())

      setEvents((prev) => [...prev, ...res2])

      console.log(res2)    
      saveAppointments(res2);  
        // keep a local mirror
    } catch (error) { 
      // 2) fallback to shared mock
      console.error(error.message)
      if (!active) return;
      //const list = loadAppointments();
      //setEvents(list);
    }

    // 3) handle deep-link "?open=<id>"
    const params = new URLSearchParams((window.location.hash.split("?")[1]) || "");
    const openId = params.get("open");
    if (openId) {
      const target = (typeof events !== "undefined" ? events : []).find(e => String(e.id) === String(openId));
      if (target) {
        //  setSelected(target) / setShowModal(true)
        setSelected(target);
        setShowModal(true);
      }
    }
  })();
  return () => { active = false; };
}, []);



  const eventsThisWeek =  useMemo(() => {
    const weekStart = anchor.getTime();
    const weekEnd = addDays(anchor, 7).getTime();
    return events
      .filter((ev) => {
        const t = new Date(ev.start).getTime();
        return t >= weekStart && t < weekEnd;
      })
      .map((ev) => {
        console.log(ev.status);
        const dt = new Date(ev.start);
        const label = dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
        const json = {
          ...ev,
          labelTime: label,
          dayIndex: getDayIndex(anchor, dt),
          rowStart: timeToRow(dt.getHours(), dt.getMinutes()),
        }

        return json;
      });
  }, [anchor, events]);

  useEffect(() => {
  console.log("Updated eventsThisWeek:", eventsThisWeek);
}, [eventsThisWeek]);

  // -- auto-scroll to 08:00
  useEffect(() => {
    if (scrollRef.current) {
      const y = (8 - START_HOUR) * ROW_HEIGHT;
      scrollRef.current.scrollTop = Math.max(0, y - 20);
    }
  }, [anchor]);

  // -- grid rows
  const gridRows = `48px repeat(${HOURS.length}, ${ROW_HEIGHT}px)`;

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="cal-page">
        {/* top bar */}
        
        <div className="cal-topbar">
          <div>
            <h1 className="cal-title">Calendar</h1>
            <div className="cal-month">{monthLabel(anchor)}</div>
            {loading && <div style={{ marginTop: 6, color: "#6b7a90" }}>Loading appointments…</div>}
            {!loading && error && (
              <div style={{ marginTop: 6, color: "#b45309" }}>Showing mock data (API not ready).</div>
            )}
          </div>

          <div className="cal-actions">
            <button className="cal-btn" onClick={() => setAnchor(addDays(anchor, -7))}>‹ Prev</button>
            <button className="cal-btn" onClick={() => setAnchor(startOfWeek(new Date()))}>Today</button>
            <button className="cal-btn" onClick={() => setAnchor(addDays(anchor, 7))}>Next ›</button>
            
            <AppointmentButton />

            <div className="cal-avatar" aria-label="profile" />
          </div>
        </div>

        {/* board */}
        <div className="cal-scroll" ref={scrollRef}>
          <div className="cal-board" style={{ gridTemplateRows: gridRows }}>
            {/* headers */}
            <div className="cal-corner cal-sticky" />
            {weekDays.map((d, i) => (
              <div
                key={d.toISOString()}
                className="cal-dayhead cal-sticky"
                style={{ gridColumn: `${i + 2} / ${i + 3}`, gridRow: "1 / 2" }} // column 2..8, row 1
              >
                {dayHeaderLabel(d)}
              </div>
            ))}

            {/* hours + cells */}
            {HOURS.map((h, idx) => {
              const row = idx + 2; // row 2..(24+1)
              return (
                <React.Fragment key={h}>
                  <div
                    className="cal-hour"
                    style={{ gridColumn: "1 / 2", gridRow: `${row} / ${row + 1}` }}
                  >
                    {hourLabel(h)}
                  </div>
                  {weekDays.map((_, i) => (
                    <div
                      key={`${h}-${i}`}
                      className="cal-cell"
                      style={{ gridColumn: `${i + 2} / ${i + 3}`, gridRow: `${row} / ${row + 1}` }}
                    />
                  ))}
                </React.Fragment>
              );
            })}

            {/* events */}
            {eventsThisWeek.map((ev) => {
              try {
              const gridColumn = ev.dayIndex + 2;          // 1 = time rail
              const baseRow = Math.floor(ev.rowStart) + 2; // + header row
              const offsetPct = (ev.rowStart - Math.floor(ev.rowStart)) * 100;
              const heightPx = (ev.durationMin / 60) * ROW_HEIGHT;
              return (
                ev.status == "Available"? (<button
                  key={ev.appointment_id}
                  className="cal-event-available"
                  style={{
                    gridColumn, 
                    gridRow: `${baseRow} / span 1`,
                    transform: `translateY(${offsetPct}%)`,
                    height: `${heightPx - 12}px`,
                    alignSelf: "start",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                  onClick={() => { setSelected(ev); setConfirmCancel(false); }}
                  title={`${ev.labelTime} — with ${ev.mentor_name}${ev.location ? " · " + ev.location : ""}`}
                >
                  <div className="cal-event-time">{ev.labelTime}</div>
                  <div className="cal-event-title">with {ev.mentor_name}</div>
                  {ev.location ? <div className="cal-event-loc">{ev.location}</div> : null}
                </button> ): 
                (<button
                  key={ev.appointment_id}
                  className="cal-event"
                  style={{
                    gridColumn, 
                    gridRow: `${baseRow} / span 1`,
                    transform: `translateY(${offsetPct}%)`,
                    height: `${heightPx - 12}px`,
                    alignSelf: "start",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                  onClick={() => { setSelected(ev); setConfirmCancel(false); }}
                  title={`${ev.labelTime} — with ${ev.mentor_name}${ev.location ? " · " + ev.location : ""}`}
                >
                  <div className="cal-event-time">{ev.labelTime}</div>
                  <div className="cal-event-title">with {ev.mentor_name}</div>
                  {ev.location ? <div className="cal-event-loc">{ev.location}</div> : null}
                </button> ))} catch (error) {
                console.error(error.message)
              };
            })}

            <div className="cal-overlay" aria-hidden="true" />
          </div>
        </div>
        
        {/* dialog */}
        {selected && (
          <div className="cal-modal-backdrop" onClick={() => { setSelected(null); setConfirmCancel(false); }}>
            <div className="cal-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="cal-modal-title">Booking details</h3>

              <div className="cal-modal-body">
                <div><b>Time:</b> {new Date(selected.start).toLocaleString()}</div>
                <div><b>With:</b> {selected.mentor_name}</div>
                {selected.location && <div><b>Location:</b> {selected.location}</div>}
              </div>

              {!confirmCancel ? (
                <div className="cal-modal-actions">
                  <button className="cal-btn" onClick={() => { setSelected(null); setConfirmCancel(false); }}>Close</button>
                  <button className="cal-btn danger" onClick={() => setConfirmCancel(true)}>Cancel booking</button>
                </div>
              ) : (
                <>
                  <div className="cal-modal-confirm">Are you sure you want to cancel this booking?</div>
                  <div className="cal-modal-actions">
                    <button className="cal-btn" onClick={() => setConfirmCancel(false)}>Back</button>
                    <button
                      className="cal-btn danger strong"
                      onClick={async () => {
                        try {
                          if (typeof apiCancel === "function") await apiCancel(selected.appointment_id);
                        } finally {
                          setEvents((list) => list.filter((x) => x.id !== selected.appointment_id));
                          setSelected(null);
                          setConfirmCancel(false);
                        }
                      }}
                    >
                      Confirm cancel
                    </button>
                  </div>
                </>
              )}
            </div>
            
          </div>
        )}
      </main>
    </div>
  );
}
