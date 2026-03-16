// src/components/SignInRequired.jsx
import React from "react";
import Sidebar from "./Sidebar.jsx";

/** Read the signed-in user from localStorage. */
export function getSignedInUser() {
  try {
    const raw = localStorage.getItem("nc_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function SignInRequired({ title = "Sign in required", message, wrapClass }) {
  return (
    <div className="dashboard">
      <Sidebar />
      <main className={wrapClass}>
        {title ? <h1 style={{ marginBottom: 4 }}>{title}</h1> : null}

        <section className="panel" style={{ padding: 16 }}>
          <p style={{ margin: 0 }}>
            {message || "You need to sign in to continue."}
          </p>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="btn primary" onClick={() => (window.location.hash = "/auth?screen=login")}>
              Go to Login
            </button>
            <button className="btn" onClick={() => (window.location.hash = "/about")}>
              Back to About
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
