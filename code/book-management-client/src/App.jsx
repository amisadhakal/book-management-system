import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/Layout";
import BooksList from "./pages/BooksList";
import BookForm from "./pages/BookForm";
import BookDetails from "./pages/BookDetails";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import UsersPage from "./pages/UsersPage";
import Cart from "./pages/Cart";
import Favorites from "./pages/Favorites";
import { SelectionProvider } from "./context/SelectionContext";

// Require login; optionally require admin role
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin()) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Protected layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<BooksList />} />
        <Route path="/books/:id" element={<BookDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/favorites" element={<Favorites />} />

        {/* Admin-only routes */}
        <Route
          path="/books/new"
          element={
            <ProtectedRoute adminOnly>
              <BookForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/books/:id/edit"
          element={
            <ProtectedRoute adminOnly>
              <BookForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute adminOnly>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute adminOnly>
              <UsersPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SelectionProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </SelectionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
