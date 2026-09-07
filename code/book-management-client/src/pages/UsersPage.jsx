import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function UsersPage() {
  const { allUsers, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin()) navigate("/", { replace: true });
  }, [isAdmin, navigate]);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">All registered accounts in BookVault</p>
        </div>
      </div>

      <div className="users-table-wrap">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="user-cell">
                    <div className={`user-avatar avatar-${u.role}`}>{u.avatar}</div>
                    <span>{u.name}</span>
                  </div>
                </td>
                <td style={{ color: "var(--text-2)", fontSize: "0.88rem" }}>{u.email}</td>
                <td>
                  <span className={`role-badge role-${u.role}`}>
                    {u.role === "admin" ? "⚡ Admin" : "👤 User"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
