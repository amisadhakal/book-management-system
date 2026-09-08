import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

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
        <button
          className="btn btn-ghost btn-icon mobile-theme-btn"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          aria-label="Toggle theme"
          style={{ marginLeft: "auto" }}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </header>

      {/* Sidebar overlay (mobile) */}
      <div
        className={`sidebar-overlay${sidebarOpen ? " show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        {/* Brand */}
        <div className="brand-wrap">
          <NavLink to="/" className="brand" end>
            <div className="brand-icon">📚</div>
            <div>
              <div className="brand-text">BookVault</div>
              <div className="brand-sub">Management</div>
            </div>
          </NavLink>
          <button
            className="btn btn-ghost btn-icon theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Navigation */}
        <nav className="side-nav">
          <span className="nav-section-label">Library</span>
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="nav-icon">🗂️</span> Books
          </NavLink>

          {isAdmin() && (
            <NavLink to="/books/new" className={({ isActive }) => (isActive ? "active" : "")}>
              <span className="nav-icon">➕</span> Add Book
            </NavLink>
          )}

          {isAdmin() && (
            <>
              <span className="nav-section-label" style={{ marginTop: "8px" }}>Analytics</span>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
                <span className="nav-icon">📊</span> Dashboard
              </NavLink>
            </>
          )}

          {isAdmin() && (
            <>
              <span className="nav-section-label" style={{ marginTop: "8px" }}>Admin</span>
              <NavLink to="/users" className={({ isActive }) => (isActive ? "active" : "")}>
                <span className="nav-icon">👥</span> Users
              </NavLink>
            </>
          )}
        </nav>

        {/* User info + logout */}
        <div className="sidebar-user-card">
          <div className={`sidebar-avatar avatar-${user?.role}`}>
            {user?.avatar || "?"}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className={`sidebar-user-role role-${user?.role}`}>
              {user?.role === "admin" ? "⚡ Admin" : "👤 User"}
            </div>
          </div>
          <button
            className="btn btn-ghost btn-icon logout-btn"
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
          >
            <svg
              className="logout-svg-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
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
