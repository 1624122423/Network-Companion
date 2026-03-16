// src/page/Favorites.jsx
import Sidebar from '../components/Sidebar.jsx';
export default function FavoritesPage() {
  return (
    <div className="dashboard">
      <Sidebar />
      <main>
        <h2>Favorites</h2>
        <p>List of your saved mentors (placeholder).</p>
      </main>
      <aside className="right-panel" />
    </div>
  );
}
