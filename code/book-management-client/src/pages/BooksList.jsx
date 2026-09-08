import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { booksApi, coverImageUrl } from "../api/client";
import Stars from "../components/Stars";
import { useAuth } from "../context/AuthContext";

export default function BooksList() {
  const [books, setBooks] = useState([]);
  const [options, setOptions] = useState({ genres: [], statuses: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("grid");
  const { isAdmin } = useAuth();

  useEffect(() => {
    booksApi.getOptions().then(setOptions).catch(() => {});
  }, []);

  async function loadBooks(filter) {
    setLoading(true);
    setError(null);
    try {
      const data = await booksApi.list(filter);
      setBooks(data);
    } catch {
      setError("Couldn't reach the API. Is BookManagement.Web running on the configured port?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks({});
  }, []);

  function handleFilter(e) {
    e.preventDefault();
    loadBooks({
      searchTerm: searchTerm || undefined,
      genre: genre || undefined,
      status: status || undefined,
    });
  }

  function clearFilters() {
    setSearchTerm("");
    setGenre("");
    setStatus("");
    loadBooks({});
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Books</h1>
          <p className="page-subtitle">Browse and manage your book inventory</p>
        </div>
        {isAdmin() && (
          <Link to="/books/new" className="btn btn-primary">
            ＋ Add Book
          </Link>
        )}
      </div>

      <form className="filter-bar" onSubmit={handleFilter}>
        <input
          type="text"
          placeholder="🔍 Search title or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">All genres</option>
          {options.genres.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {options.statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary btn-sm">
          Filter
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters}>
          Clear
        </button>
        <div className="view-toggle">
          <button
            type="button"
            className={view === "grid" ? "active" : ""}
            onClick={() => setView("grid")}
            title="Grid view"
          >
            ▦
          </button>
          <button
            type="button"
            className={view === "list" ? "active" : ""}
            onClick={() => setView("list")}
            title="List view"
          >
            ☰
          </button>
        </div>
      </form>

      {error && <p className="error-banner">⚠️ {error}</p>}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner-ring" />
          Loading books…
        </div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">📭</span>
          No books match your filters yet.
        </div>
      ) : view === "grid" ? (
        <div className="book-grid">
          {books.map((book) => (
            <Link to={`/books/${book.id}`} key={book.id} className="book-card">
              <div className="book-cover">
                {book.coverImagePath ? (
                  <img src={coverImageUrl(book.coverImagePath)} alt={book.title} loading="lazy" />
                ) : (
                  <div className="cover-placeholder">
                    <span className="cover-placeholder-icon">📖</span>
                    No Cover
                  </div>
                )}
                <span className={`status-badge status-${book.status.toLowerCase()}`}>
                  {book.status}
                </span>
              </div>
              <div className="book-card-body">
                <h3>{book.title}</h3>
                <p className="muted">{book.author}</p>
                <Stars value={book.rating} />
                <div className="book-meta">
                  <span className="book-genre-tag">{book.genre}</span>
                  <span className="book-price">₹{book.price.toFixed(2)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="book-list">
          {books.map((book) => (
            <Link to={`/books/${book.id}`} key={book.id} className="book-row">
              <div className="row-cover">
                {book.coverImagePath ? (
                  <img src={coverImageUrl(book.coverImagePath)} alt={book.title} loading="lazy" />
                ) : (
                  <div className="cover-placeholder small">📖</div>
                )}
              </div>
              <div className="row-main">
                <h3>{book.title}</h3>
                <p className="muted">{book.author}</p>
              </div>
              <span className="row-genre">{book.genre}</span>
              <Stars value={book.rating} />
              <span className="row-price">₹{book.price.toFixed(2)}</span>
              <span className={`status-badge status-${book.status.toLowerCase()} static`}>
                {book.status}
              </span>
            </Link>
          ))}
        </div>
      )}

      {!loading && !error && (
        <div className="status-bar">
          <div className="status-bar-dot" />
          {books.length} book{books.length === 1 ? "" : "s"} in library
        </div>
      )}
    </div>
  );
}
