import { useEffect } from "react";
import "./Modal.css";

export default function Modal({ open, title, children, onClose }) {
  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {title ? <h2 className="modal-title">{title}</h2> : null}
        <div className="modal-body">{children}</div>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
      </div>
    </div>
  );
}
