export default function MentorCard({ mentor, onOpen }) {
  return (
    <div className="card" onClick={() => onOpen(mentor)}>
      <div className="avatar"></div>
      <div className="card-info">
        <h3>{mentor.name}</h3>
        <p>{mentor.position}</p>
        <p>{mentor.experienceYears} yrs exp</p>
      </div>
    </div>
  );
}
