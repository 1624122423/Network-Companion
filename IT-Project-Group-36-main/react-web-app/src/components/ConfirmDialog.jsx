// src/components/ConfirmDialog.jsx
import React from "react";

export default function ConfirmDialog({ open, title="Confirm", message, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>{title}</h3>
        {message && <p style={{ marginTop: 8 }}>{message}</p>}
        <div style={{ display:"flex", gap:8, marginTop: 14, justifyContent: "flex-end" }}>
          <button className="btn" onClick={onCancel}>No</button>
          <button className="btn primary" onClick={onConfirm}>Yes</button>
        </div>
      </div>
    </div>
  );
}

