import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import "./Settings.css";
import { logout, getMentorMe, registerMentors, createTimeSlots } from "../api.js";
import BecomeMentorModal from "../components/BecomeMentorModal";

const LS_SETTINGS_KEY = "nc_settings_v1";

function getCurrentUser() {
  try {
    const raw = localStorage.getItem("nc_user");
    if (!raw) return { username: "", email: "" };
    const u = JSON.parse(raw);
    return { username: u?.username || "", email: u?.email || "" };
  } catch {
    return { username: "", email: "" };
  }
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(LS_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSettings(next) {
  try {
    localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(next));
  } catch {}
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.removeAttribute("data-theme");
  if (theme && theme !== "system") root.setAttribute("data-theme", theme);
}

function toLocalISO(dateStr, timeStr) {
  const localDate = new Date(`${dateStr}T${timeStr}`);
  return new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000).toISOString();
}

export default function Settings() {
  // Account (read-only)
  const [account, setAccount] = useState({ username: "", email: "" });

  // Editable blocks (mock persisted)
  const [profile, setProfile] = useState({ displayName: "", gender: "", suburb: "", interests: "" });
  const [prefs, setPrefs] = useState({ theme: "system" });
  const [notify, setNotify] = useState({ emailUpdates: true, calendarReminders: true });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Mentor mode & availability
  const [mentorMode, setMentorMode] = useState(false);
  const [checkingMentor, setCheckingMentor] = useState(true);
  const [mentorModalOpen, setMentorModalOpen] = useState(false);

  const [slotDate, setSlotDate] = useState("");
  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");
  const [slotLoc, setSlotLoc] = useState("");

  // Load on mount
  useEffect(() => {
    setAccount(getCurrentUser());
    const loaded = loadSettings();
    if (loaded?.profile) setProfile({
      displayName: loaded.profile.displayName || "",
      gender: loaded.profile.gender || "",
      suburb: loaded.profile.suburb || "",
      interests: loaded.profile.interests || "",
    });
    if (loaded?.prefs) setPrefs({ theme: loaded.prefs.theme || "system" });
    if (loaded?.notify) setNotify({
      emailUpdates: typeof loaded.notify.emailUpdates === "boolean" ? loaded.notify.emailUpdates : true,
      calendarReminders: typeof loaded.notify.calendarReminders === "boolean" ? loaded.notify.calendarReminders : true,
    });
  }, []);

  // Detect mentor on mount
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getMentorMe();
        if (!alive) return;
        setMentorMode(Boolean(res && (res.mentor_id || res.uid)));
      } catch {
        setMentorMode(false);
      } finally {
        if (alive) setCheckingMentor(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Apply theme
  useEffect(() => { applyTheme(prefs.theme); }, [prefs.theme]);

  const onSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      saveSettings({ profile, prefs, notify, updatedAt: new Date().toISOString() });
      setSaved(true);
    } finally {
      setSaving(false);
      setTimeout(() => setSaved(false), 1600);
    }
  };

  const onToggleMentor = async () => {
    const next = !mentorMode;
    if (!next) { setMentorMode(false); return; }
    try {
      setCheckingMentor(true);
      const res = await getMentorMe();
      if (res && (res.mentor_id || res.uid)) setMentorMode(true);
      else setMentorModalOpen(true);
    } catch {
      setMentorModalOpen(true);
    } finally {
      setCheckingMentor(false);
    }
  };

  const handleMentorSignupSuccess = () => {
    setMentorModalOpen(false);
    setMentorMode(true);
  };

  const onAddSlot = async () => {
    if (!slotDate || !slotStart || !slotEnd) return;
    try {
      const start_time = toLocalISO(slotDate, slotStart);
      const end_time = toLocalISO(slotDate, slotEnd);
      await createTimeSlots({ start_time, end_time, location: slotLoc || undefined });
      setSlotStart(""); setSlotEnd(""); setSlotLoc("");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="dashboard no-right">
      <Sidebar />
      <main>
        <div className="settings">
          <header className="settings-header">
            <div className="settings-actions">
              <button className="cta-btn" onClick={doClientLogout}>Log out</button>
              <button className="cta-btn cta-primary" onClick={onSave} disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </header>

          {/* Account */}
          <section className="panel">
            <h2>Account</h2>
            <div className="grid2">
              <label className="field">
                <span>Username</span>
                <input type="text" value={account.username || "—"} readOnly />
              </label>
              <label className="field">
                <span>Email</span>
                <input type="email" value={account.email || "—"} readOnly />
              </label>
            </div>
            <div className="hint">These are read-only basics saved on this device after you sign in.</div>
          </section>

          {/* Profile */}
          <section className="panel">
            <h2>Profile</h2>
            <div className="grid2">
              <label className="field">
                <span>Display name</span>
                <input
                  type="text"
                  placeholder="How others see you"
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Gender</span>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                >
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="field">
                <span>Suburb</span>
                <input
                  type="text"
                  placeholder="e.g., Carlton"
                  value={profile.suburb}
                  onChange={(e) => setProfile({ ...profile, suburb: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Interests</span>
                <input
                  type="text"
                  placeholder="e.g., Data Science, System Design"
                  value={profile.interests}
                  onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
                />
                <div className="hint">Use commas to separate multiple items.</div>
              </label>
            </div>
          </section>

          {/* Preferences */}
          <section className="panel">
            <h2>Preferences</h2>
            <div className="grid2">
              <label className="field">
                <span>Theme</span>
                <select value={prefs.theme} onChange={(e) => setPrefs({ ...prefs, theme: e.target.value })}>
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </label>
            </div>
          </section>

          {/* Notifications */}
          <section className="panel">
            <h2>Notifications</h2>
            <label className="switch">
              <input
                type="checkbox"
                checked={notify.emailUpdates}
                onChange={(e) => setNotify({ ...notify, emailUpdates: e.target.checked })}
              />
              <span>Email updates</span>
            </label>
            <label className="switch">
              <input
                type="checkbox"
                checked={notify.calendarReminders}
                onChange={(e) => setNotify({ ...notify, calendarReminders: e.target.checked })}
              />
              <span>Calendar reminders</span>
            </label>
          </section>

          {/* Mentor mode */}
          <section className="panel">
            <h2>Mentor mode</h2>
            <label className="switch">
              <input
                type="checkbox"
                checked={mentorMode}
                onChange={onToggleMentor}
                disabled={checkingMentor}
              />
              <span>{mentorMode ? "ON" : "OFF"}</span>
            </label>
            <div className="hint">Turn on to publish availability and receive bookings.</div>
          </section>

          {/* Availability */}
          {mentorMode && (
            <section className="panel">
              <h2>My Availability</h2>
              <div className="avail-grid">
                <input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} />
                <input type="time" value={slotStart} onChange={(e) => setSlotStart(e.target.value)} />
                <input type="time" value={slotEnd} onChange={(e) => setSlotEnd(e.target.value)} />
                <input
                  type="text"
                  placeholder="Location (optional)"
                  value={slotLoc}
                  onChange={(e) => setSlotLoc(e.target.value)}
                />
                <button className="btn primary" onClick={onAddSlot}>Add</button>
              </div>
              <div className="hint">Times are sent as ISO (UTC) to the API.</div>
            </section>
          )}

          {saved && <div className="ok-toast">Saved ✓</div>}
        </div>

        <BecomeMentorModal
          open={mentorModalOpen}
          onClose={() => setMentorModalOpen(false)}
          onSuccess={handleMentorSignupSuccess}
          onGoOnboarding={() => {
          setMentorModalOpen(false);
          window.location.hash = "/onboarding/mentor"; 
          }}
        />
      </main>
    </div>
  );
}

function doClientLogout() {
  const ok = window.confirm("Are you sure you want to log out?");
  if (!ok) return;
  try { logout(); } finally {
    localStorage.removeItem("nc_user");
    window.location.hash = "/about";
  }
}
