import Modal from "./Modal";
import "./BecomeMentorModal.css";

export default function BecomeMentorModal({ open, onClose, onGoOnboarding }) {

  return (
    <Modal open={open} onClose={onClose} title="Become a mentor?">
      <p className="bm-text">
        You signed up successfully. If you’d like to take mentees, set up your mentor profile now.
        You can also do this later from Settings.
      </p>

      <div className="bm-actions">
        <button className="bm-btn-secondary" onClick={onClose}>
          Maybe later
        </button>
        <button className="bm-btn-primary" onClick={onGoOnboarding}>
          Set up mentor profile
        </button>
      </div>
    </Modal>
  );
}
