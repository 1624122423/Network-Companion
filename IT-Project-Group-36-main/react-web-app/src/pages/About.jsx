// src/pages/About.jsx


import React from "react";
import Sidebar from "../components/Sidebar.jsx";
import { getSignedInUser } from "../components/SignInRequired.jsx"; 
import "./About.css";
import { logout } from "../api.js";

export default function About() {
  // Read current signed-in user (same helper used by Dashboard)
  const user = getSignedInUser();
  const email = user?.email || "";

  // CTA variables depend on auth state
  const ctaTitle = user ? "Ready to meet your mentor?" : "Ready to start?";
  const ctaLabel = user ? "Find your mentor" : "Start now";
  const ctaHref  = user ? "#/dashboard" : "#/auth?screen=signup&role=mentee";

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="about-page">
        {/* Hero */}
        <section className="about-hero about-hero--dark solo">
          <div className="about-hero__inner">
            <div className="about-hero__copy">
              <span className="about-badge">Mentoring & Relationship</span>
              <h1 className="about-title about-title--hero">
                Build long-term mentor relationships—<br />not just one-off bookings.
              </h1>
              <p className="about-lead">
                NetworkCompanion helps students connect with mentors and keep growing together:
                discover mentors, book sessions in one click, and track progress over time
                in a clean weekly calendar.
              </p>
              <div className="about-cta">
                {/* Keep the original hero primary CTA */}
                <a href="/#/dashboard" className="about-btn primary">Start finding mentors</a>
              </div>
            </div>
          </div>
        </section>

        {/* Value props */}
        <section className="about-grid">
          <div className="about-card">
            <h3>Grow together</h3>
            <p>Work with the same mentor over time and keep momentum between sessions.</p>
          </div>
          <div className="about-card">
            <h3>One-click booking</h3>
            <p>Pick a slot and confirm in seconds—no back-and-forth messages.</p>
          </div>
          <div className="about-card">
            <h3>Calendar view</h3>
            <p>Your upcoming sessions are always visible in a weekly calendar.</p>
          </div>
          <div className="about-card">
            <h3>Notes & reminders</h3>
            <p>Capture follow-ups and stay on track with gentle reminders.</p>
          </div>
        </section>

        {/* ole guides: As mentee / As mentor  */}
        <section className="about-how">
          <h2>How it works</h2>
          {/* Two columns style using the same card section styling */}
          <div className="about-bullets" style={{gridTemplateColumns: "1fr 1fr"}}>
            <div>
              <h3>As mentee</h3>
              <ul>
                <li>Explore mentors by name, category, or location.</li>
                <li>Book a session instantly from the mentor’s profile.</li>
                <li>Use the weekly calendar to view, reschedule, or cancel.</li>
                <li>Take notes after each session and set gentle reminders.</li>
              </ul>
            </div>
            <div>
              <h3>As mentor</h3>
              <ul>
                <li>Create your mentor profile with expertise, bio, and availability.</li>
                <li>Receive bookings and manage them from your calendar.</li>
                <li>Keep session notes and track mentee progress over time.</li>
                <li>
                  Switch to <b>Mentor Mode</b> in <b>Settings</b> once your mentor account is set up.
                </li>
              </ul>
            </div>
          </div>
          {!user && (
            <p className="about-note">
              We default new sign-ups to <b>mentee</b>. After you register, you can also register as a mentor and switch in Settings.
            </p>
          )}
          {user && (
            <p className="about-note">
              You’re currently signed in as <b>{email}</b>. If you’ve created a mentor profile, you can switch to <b>Mentor Mode</b> in <b>Settings</b>.
            </p>
          )}
        </section>

        {/* Highlights */}
        <section className="about-highlights">
          <h2>Feature highlights</h2>
          <ul className="about-bullets">
            <li>Smart search</li>
            <li>Booking modal</li>
            <li>Weekly calendar</li>
            <li>Favorites</li>
            <li>Reminders & notes</li>
          </ul>
        </section>

        {/*FAQ  */}
        <section className="about-faq">
          <h2>FAQ</h2>
          <details>
            <summary>Is it free?</summary>
            <p>The core features are free for students during beta.</p>
          </details>
          <details>
            <summary>Can I work with the same mentor long-term?</summary>
            <p>Yes. Rebook sessions and use notes/reminders to keep momentum.</p>
          </details>
          <details>
            <summary>Can I reschedule or cancel?</summary>
            <p>Open the booking on your calendar page to reschedule or cancel.</p>
          </details>
          <details>
            <summary>Where is my data stored?</summary>
            <p>We store minimal data and follow industry-standard security practices.</p>
          </details>
        </section>

        {/*Bottom CTA: login-aware */}
        <section className="about-cta-card">
          <h3 className="about-cta-title">{ctaTitle}</h3>
          <a className="cta-btn cta-primary cta-large" href={ctaHref}>
            {ctaLabel}
          </a>

          {user && (
            <button
                type="button"
                className="cta-btn cta-large"
                onClick={handleAboutLogout}
                style={{ marginLeft: 10 }}
             >           
                Log out
            </button>
                 )}

        
          {/* Explanatory line right next to the CTA */}
          {!user ? (
            <p className="about-note" style={{marginTop: 12}}>
              We default sign-ups to <b>mentee</b>. After signing up, you can opt in as a mentor and switch in Settings.
            </p>
          ) : (
            <p className="about-note" style={{marginTop: 12}}>
              You’re signed up as <b>{email}</b>. Create a mentor profile to enable <b>Mentor Mode</b> and switch in Settings.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}



function handleAboutLogout(e) {
  e.preventDefault(); 
  if (!window.confirm("Are you sure you want to log out?")) return;

  try {
    logout()
     //fetch("/api/users/logout", { method: "POST" }).catch(() => {});
  } finally {
    
    localStorage.removeItem("nc_user");
    sessionStorage.clear();
  
    window.location.replace("/#/about");

    setTimeout(() => window.location.reload(), 0);
  }
  
}

