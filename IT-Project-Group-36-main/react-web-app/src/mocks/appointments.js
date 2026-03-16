// src/mocks/appointments.js
// Single source of truth for mock appointments (used when API is offline).

const LS_APPTS_KEY = "nc_appointments_v2";

function seed() {
  const now = new Date();
  const at = (d, h, m = 0, durMin = 45) => {
    const t = new Date(now);
    t.setDate(t.getDate() + d);
    t.setHours(h, m, 0, 0);
    const start = t.toISOString();
    const end = new Date(t.getTime() + durMin * 60 * 1000).toISOString();
    return { start, end };
  };
  const mock = [
    { appointment_id: "a1", title: "meeting", mentor_name: "Josh", location: "Unimelb", ...at(1,10), status: "upcoming" },
    { appointment_id: "a2", title: "meeting", mentor_name: "Desmond",   location: "State Library", ...at(3,14,0,30), status: "upcoming" },
    { appointment_id: "a3", title: "meeting", mentor_name: "Yanzhao Wang", location: "Starbucks", ...at(7,9,30,60), status: "upcoming" },
  ];
  try { localStorage.setItem(LS_APPTS_KEY, JSON.stringify(mock)); } catch {}
  return mock;
}

/** Load from localStorage; seed if empty. */
export function loadAppointments() {
  try {
    const raw = localStorage.getItem(LS_APPTS_KEY);
    if (!raw) return seed();
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.length ? list : seed();
  } catch {
    return seed();
  }
}

/** Save to localStorage. */
export function saveAppointments(list) {
  try { localStorage.setItem(LS_APPTS_KEY, JSON.stringify(list)); console.log(localStorage.getItem(LS_APPTS_KEY))} catch (error) { console.error(error.message)}
}
