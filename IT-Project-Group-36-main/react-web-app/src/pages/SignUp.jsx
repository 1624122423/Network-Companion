// src/pages/SignUp.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api.js";
import BecomeMentorModal from "../components/BecomeMentorModal.jsx"; // add
import "./Auth.css";
import "./SignUp.css";

export default function SignUp() {
  const navigate = useNavigate();

  // ----- UI state -----
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  // Controls the "Become mentor?" modal after successful signup
  const [showMentorModal, setShowMentorModal] = useState(false); // add

  // ----- Validation (unchanged) -----
  const validate = () => {
    if (!form.username.trim()) return "Please enter a username.";
    if (!form.first_name) return "Please enter your first name";
    if (!form.last_name) return "Please enter your last name";
    if (!form.email.trim()) return "Please enter an email address.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email.";
    if (form.password.length === 0) return "Please enter a password.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return "";
  };

  // ----- Handlers -----
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    try {
      setError("");
      setPending(true);

      // 1) Create the user in backend (already wired to Firebase in api.js)
      await signup({
        username: form.username.trim(),
        email: form.email.trim(),
        first_name: form.first_name,
        last_name: form.last_name,
        password: form.password
      });
      // 2) Show the "Become a mentor?" modal instead of navigating immediately
      setShowMentorModal(true);
    } catch (err) {
      const message =
        err?.payload?.message ||
        err?.message ||
        "Sign up failed. Please try again.";
      setError(message);
    } finally {
      setPending(false);
    }
  };

  // Store a copy locally so Settings/Profile can show it immediately
  localStorage.setItem(
  "nc_user",
    JSON.stringify({
      username: form.username.trim() || form.email.trim().split("@")[0],
      email: form.email.trim()
  })
);

  // When user clicks "Maybe later" on the modal
  const handleMaybeLater = () => {
    setShowMentorModal(false);
    // You can change this to navigate("/dashboard") if needed
    navigate("/auth"); // go to login page by default
  };

  // When user chooses to set up mentor profile now
  const handleGoOnboarding = () => {
    setShowMentorModal(false);
    navigate("/onboarding/mentor");
  };

  return (
    <div className="auth-page">
      <form className="auth-card signup-card" onSubmit={onSubmit} noValidate>
        <h1 className="auth-title">Create your account</h1>

        {error ? <div className="auth-error">{error}</div> : null}

        <label className="auth-label" htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          className="auth-input"
          placeholder="Your username"
          value={form.username}
          onChange={onChange}
          autoComplete="username"
        />

        <label className="auth-label" htmlFor="first_name">First Name</label>
        <input
          id="first_name"
          name="first_name"
          className="auth-input"
          placeholder="first name"
          value={form.first_name}
          onChange={onChange}
        />

        <label className="auth-label" htmlFor="last_name">Last Name</label>
        <input
          id="last_name"
          name="last_name"
          className="auth-input"
          placeholder="last name"
          value={form.last_name}
          onChange={onChange}
        />

        <label className="auth-label" htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          className="auth-input"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={onChange}
          autoComplete="email"
        />

        <label className="auth-label" htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          className="auth-input"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={onChange}
          autoComplete="new-password"
        />

        <label className="auth-label" htmlFor="confirmPassword">Confirm password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          className="auth-input"
          type="password"
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={onChange}
          autoComplete="new-password"
        />

        {/* hidden implicit role (kept for future use) */}
        <input type="hidden" name="role" value={form.role} readOnly />

        <button className="auth-btn" type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create account"}
        </button>

        <div className="auth-foot">
          Already have an account? <a href="#/auth">Log in</a>
        </div>
      </form>

      {/* Become-mentor modal */}
      <BecomeMentorModal
        open={showMentorModal}
        onClose={handleMaybeLater}
        onGoOnboarding={handleGoOnboarding}
      />
    </div>
  );
}
