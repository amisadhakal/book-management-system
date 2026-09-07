import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      {/* Mobile header */}
      <header className="mobile-header">
        <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          <span />
          <span />
          <span />
        </button>
        <span className="mobile-brand">📚 BookVault</span>
      </header>

      {/* Sidebar overlay (mobile) */}
      <div
        className={`sidebar-overlay${sidebarOpen ? " show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <NavLink to="/" className="brand" end>
          <div className="brand-icon">📚</div>
          <div>
            <div className="brand-text">BookVault</div>
            <div className="brand-sub">Management</div>
          </div>
        </NavLink>

        <nav className="side-nav">
          <span className="nav-section-label">Library</span>
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="nav-icon">🗂️</span> Books
          </NavLink>
          <NavLink to="/books/new" className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="nav-icon">➕</span> Add Book
          </NavLink>

          <span className="nav-section-label" style={{ marginTop: "8px" }}>Analytics</span>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="nav-icon">📊</span> Dashboard
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div style={{ fontSize: "0.72rem", fontWeight: 600, marginBottom: 4 }}>BookVault v1.0</div>
          <div style={{ fontSize: "0.7rem" }}>Book Management System</div>
        </div>
      </aside>

      <div className="main-column">
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
