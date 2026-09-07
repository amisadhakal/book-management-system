import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">📚</span>
          <span className="brand-text">Book Management</span>
        </div>
        <nav className="side-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="nav-icon">🗂️</span> Books
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="nav-icon">📊</span> Dashboard
          </NavLink>
        </nav>
      </aside>
      <div className="main-column">
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
