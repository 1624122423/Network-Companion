// src/pages/Bookings.jsx
import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import "./Dashboard.css";

import { loadAppointments, saveAppointments } from "../mocks/appointments";

import SignInRequired, { getSignedInUser } from "../components/SignInRequired.jsx";


// lazy import API to avoid cycles
const apiPromise = import("../api.js");

function fmtDate(dt) {
  const d = new Date(dt);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function fmtTime(dt) {
  const d = new Date(dt);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default function Bookings() {

   const user = getSignedInUser();

  if (!user) {
    return (
      <SignInRequired
        title="Upcoming events"
        message="You need to sign in to view and manage your bookings."
      />
    );
  }
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const mod = await apiPromise;
        const res = await mod.getBookings(); // server-first
        const list = (res?.data || []).slice();
        if (!active) return;
        setItems(list);
        saveAppointments(list); // mirror to local for Calendar
      } catch {
        if (!active) return;
        const list = loadAppointments(); // shared mock
        setItems(list);
        setErr("Using local mock (server not available).");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return items
      .filter(a => new Date(a.end).getTime() >= now)
      .sort((a, b) => new Date(a.start) - new Date(b.start));
  }, [items]);

  const groups = useMemo(() => {
    const map = new Map();
    for (const a of upcoming) {
      const key = new Date(a.start).toISOString().slice(0,10);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(a);
    }
    return Array.from(map.entries()).sort(([a],[b]) => a.localeCompare(b));
  }, [upcoming]);

  // open confirm dialog
  function askCancel(id) {
    setPendingId(id);
    setConfirmOpen(true);
  }

  async function doCancel() {
    const id = pendingId;
    setConfirmOpen(false);
    if (!id) return;
    try {
      const mod = await apiPromise;
      await mod.cancelBooking(id); // server-first
    } catch {
      // ignore network error; proceed with local update
    } finally {
      const next = items.filter(a => a.id !== id);
      setItems(next);
      saveAppointments(next); // keep Calendar in sync
      setPendingId(null);
    }
  }

  return (
    <div className="dashboard no-right">
      <Sidebar />
      <main>
        <div className="settings">
          <header className="settings-header">
            <h1>Upcoming events</h1>
            {err && <span className="muted" style={{ color:"#666" }}>{err}</span>}
          </header>

          {loading ? (
            <section className="panel"><div style={{ padding: 12 }}>Loading bookings…</div></section>
          ) : upcoming.length === 0 ? (
            <section className="panel"><div style={{ padding: 12 }}>No upcoming events.</div></section>
          ) : (
            groups.map(([dayKey, list]) => (
              <section className="panel" key={dayKey}>
                <h2 style={{ marginBottom: 8 }}>{fmtDate(dayKey)}</h2>
                <ul style={{ listStyle:"none", margin:0, padding:0, display:"flex", flexDirection:"column", gap:10 }}>
                  {list.map(a => (
                    <li key={a.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, padding:"10px 12px", border:"1px solid #eee", borderRadius:12, background:"#fff", boxShadow:"0 8px 22px rgba(0,0,0,.05)" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0 }}>
                        <div style={{ fontWeight:600, whiteSpace:"nowrap" }}>{fmtTime(a.start)}–{fmtTime(a.end)}</div>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.title || "Session"}</div>
                          <div className="muted" style={{ fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            With {a.mentorName || "mentor"} · {a.location || "TBD"}
                          </div>
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        {/* deep link: calendar opens details modal for this id */}
                        <a className="btn" href={`#/calendar?open=${encodeURIComponent(a.id)}`}>View</a>
                        <button className="btn" onClick={() => askCancel(a.id)}>Cancel</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </main>

      {/* confirm dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Cancel booking?"
        message="This action cannot be undone."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doCancel}
      />
    </div>
  );
}
