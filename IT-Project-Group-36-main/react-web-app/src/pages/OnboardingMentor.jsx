import { useState } from "react";
import "./Auth.css"; // reuse card look
import { registerMentors } from "../api"; 
import { useNavigate } from "react-router-dom";


export default function OnboardingMentor() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    expertise: "",
    bio: "",
    location: "",
    hourlyRate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body = {
      biography: form.bio.trim(),
      field_of_expertise: form.expertise,
      location: form.location.trim(),
    };

    try {
      await registerMentors(body);   
      navigate("/auth");
    } catch (err) {
      console.error(err);
      const msg = err?.payload?.message || err?.message || "Failed to create mentor profile.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card signup-card" onSubmit={onSubmit}>
        <h1 className="auth-title">Set up your mentor profile</h1>

        <label className="auth-label" htmlFor="expertise">Areas of expertise</label>
        <input id="expertise" name="expertise" className="auth-input"
               placeholder="e.g., Frontend, Algorithms, Career coaching"
               value={form.expertise} onChange={onChange} />

        <label className="auth-label" htmlFor="bio">Short bio</label>
        <textarea id="bio" name="bio" className="auth-input"
                  placeholder="Tell mentees about your experience"
                  rows={4} value={form.bio} onChange={onChange} />

        <label className="auth-label" htmlFor="location">Location</label>
        <input id="location" name="location" className="auth-input"
               placeholder="e.g., Melbourne, AU"
               value={form.location} onChange={onChange} />

        <label className="auth-label" htmlFor="hourlyRate">Hourly rate (optional)</label>
        <input id="hourlyRate" name="hourlyRate" className="auth-input" type="number"
               placeholder="e.g., 40"
               value={form.hourlyRate} onChange={onChange} />

        <button className="auth-btn" type="submit">Save profile</button>

        <div className="auth-foot">
          You can edit this later in Settings.
        </div>
      </form>
    </div>
  );
}
