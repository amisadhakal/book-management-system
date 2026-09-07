import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Small fake delay to feel real
    await new Promise((r) => setTimeout(r, 400));

    if (tab === "login") {
      const result = login(form.email, form.password);
      if (result.ok) {
        navigate("/", { replace: true });
      } else {
        setError(result.error);
      }
    } else {
      if (form.password !== form.confirm) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      const result = register(form.name, form.email, form.password);
      if (result.ok) {
        navigate("/", { replace: true });
      } else {
        setError(result.error);
      }
    }
    setLoading(false);
  }

  return (
    <div className="login-page">
      <div className="login-bg" aria-hidden="true">
        <div className="login-bg-orb orb-1" />
        <div className="login-bg-orb orb-2" />
        <div className="login-bg-orb orb-3" />
      </div>

      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">📚</div>
          <div>
            <div className="login-brand-name">BookVault</div>
            <div className="login-brand-sub">Book Management System</div>
          </div>
        </div>

        {/* Demo hint */}
        <div className="demo-accounts-hint">
          <div className="demo-accounts-hint-title">🔑 Demo Accounts</div>
          <div className="demo-account-row">
            <span className="demo-role admin-role">Admin</span>
            <span>admin@bookvault.com</span>
            <span className="demo-pw">admin123</span>
          </div>
          <div className="demo-account-row">
            <span className="demo-role user-role">User</span>
            <span>user@bookvault.com</span>
            <span className="demo-pw">user123</span>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="login-tabs">
          <button
            className={`login-tab${tab === "login" ? " active" : ""}`}
            onClick={() => { setTab("login"); setError(""); }}
            type="button"
          >
            Sign In
          </button>
          <button
            className={`login-tab${tab === "register" ? " active" : ""}`}
            onClick={() => { setTab("register"); setError(""); }}
            type="button"
          >
            Register
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="login-error">{error}</div>}

          {tab === "register" && (
            <div className="login-field">
              <label htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                autoFocus
                required
              />
            </div>
          )}

          <div className="login-field">
            <label htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              autoFocus={tab === "login"}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
            />
          </div>

          {tab === "register" && (
            <div className="login-field">
              <label htmlFor="auth-confirm">Confirm Password</label>
              <input
                id="auth-confirm"
                type="password"
                placeholder="••••••••"
                value={form.confirm}
                onChange={(e) => handleChange("confirm", e.target.value)}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary login-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-ring" style={{ width: 18, height: 18, borderWidth: 2 }} />
                {tab === "login" ? "Signing in…" : "Creating account…"}
              </>
            ) : tab === "login" ? (
              "Sign In →"
            ) : (
              "Create Account →"
            )}
          </button>
        </form>

        <p className="login-footer">
          {tab === "login" ? (
            <>Don't have an account?{" "}
              <button className="link-btn" onClick={() => setTab("register")} type="button">
                Register
              </button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button className="link-btn" onClick={() => setTab("login")} type="button">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
