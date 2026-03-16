// Minimal Auth page (login-only for Step 1)
import React, { useMemo, useState } from "react";
import "./Auth.css";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { createSession} from "../api.js"

// --- firebase init (move to a shared file later)
const firebaseConfig = {
    apiKey: "AIzaSyBhC7Sa6MwVR7AWt_Oy36kmxUw-r62IjpQ",
    authDomain: "it-project-auth-65f7e.firebaseapp.com",
    projectId: "it-project-auth-65f7e",
    storageBucket: "it-project-auth-65f7e.firebasestorage.app",
    messagingSenderId: "545277543990",
    appId: "1:545277543990:web:7f03e9d711b59ef01a3a97",
    measurementId: "G-C4V31ML5KM",
};

export default function Auth() {
    const app = useMemo(() => initializeApp(firebaseConfig), []);
    const auth = useMemo(() => getAuth(app), [app]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState("");

    // Login -> get idToken -> POST /login (same handshake you already do)
    async function handleLogin(e) {
  e.preventDefault();
  setError(""); 
  setPending(true);
  try {
    // 1) Do your existing login
    await createSession(email, password);

    // 2) Persist the signed-in user locally (for Settings/Profile display)
    //    If you don't have a username field on login, derive one from email.
    localStorage.setItem(
      "nc_user",
      JSON.stringify({
        username: email?.split("@")[0] || "",
        email
      })
    );

    // 3) Navigate as you already do
    window.location.hash = "/dashboard";
  } catch (err) {
    setError("Login failed. Please check your credentials.");
    console.error(err);
  } finally {
    setPending(false);
  }
}

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Welcome back</h2>
                <p className="auth-sub">Sign in to continue</p>

                <form className="auth-form" onSubmit={handleLogin}>
                    <input
                        className="auth-input"
                        type="email"
                        placeholder="Email"
                        autoComplete="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />

                    {error && <div className="auth-error">{error}</div>}

                    <button className="auth-btn" disabled={pending}>
                        {pending ? "Signing in..." : "Login"}
                    </button>
                </form>

                <div className="auth-foot">
                    Don’t have an account? <a href="#/signup?screen=signup&role=mentee">Sign up</a>
                </div>
            </div>
        </div>
    );
}
