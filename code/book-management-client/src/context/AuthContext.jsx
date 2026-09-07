import { createContext, useContext, useState, useEffect } from "react";

// ── Seed default accounts ─────────────────────────────────────
const SEED_ACCOUNTS = [
  {
    id: "admin-1",
    name: "Admin",
    email: "admin@bookvault.com",
    password: "admin123",
    role: "admin",
    avatar: "A",
  },
  {
    id: "user-1",
    name: "Demo User",
    email: "user@bookvault.com",
    password: "user123",
    role: "user",
    avatar: "D",
  },
];

const STORAGE_KEY_ACCOUNTS = "bv_accounts";
const STORAGE_KEY_SESSION = "bv_session";

function loadAccounts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (stored) return JSON.parse(stored);
  } catch {
    /* ignore */
  }
  // First run — seed defaults
  localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(SEED_ACCOUNTS));
  return SEED_ACCOUNTS;
}

function saveAccounts(accounts) {
  localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
}

function loadSession() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SESSION);
    if (stored) return JSON.parse(stored);
  } catch {
    /* ignore */
  }
  return null;
}

// ── Context ───────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadSession());
  const [accounts, setAccounts] = useState(() => loadAccounts());

  // Sync accounts to storage whenever they change
  useEffect(() => {
    saveAccounts(accounts);
  }, [accounts]);

  function login(email, password) {
    const match = accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (!match) {
      return { ok: false, error: "Invalid email or password." };
    }
    const session = {
      id: match.id,
      name: match.name,
      email: match.email,
      role: match.role,
      avatar: match.avatar,
    };
    setUser(session);
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    return { ok: true };
  }

  function register(name, email, password) {
    if (!name.trim() || !email.trim() || !password.trim()) {
      return { ok: false, error: "All fields are required." };
    }
    if (accounts.find((a) => a.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: "An account with this email already exists." };
    }
    if (password.length < 6) {
      return { ok: false, error: "Password must be at least 6 characters." };
    }
    const newAccount = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: "user",
      avatar: name.trim()[0].toUpperCase(),
    };
    const updated = [...accounts, newAccount];
    setAccounts(updated);

    const session = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      role: newAccount.role,
      avatar: newAccount.avatar,
    };
    setUser(session);
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    return { ok: true };
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_SESSION);
  }

  function isAdmin() {
    return user?.role === "admin";
  }

  // Expose all accounts (for admin user management view)
  const allUsers = accounts.map(({ id, name, email, role, avatar }) => ({
    id, name, email, role, avatar,
  }));

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin, allUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
