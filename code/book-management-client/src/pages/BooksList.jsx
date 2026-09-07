import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { booksApi, coverImageUrl } from "../api/client";
import Stars from "../components/Stars";

export default function BooksList() {
  const [books, setBooks] = useState([]);
  const [options, setOptions] = useState({ genres: [], statuses: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    booksApi.getOptions().then(setOptions).catch(() => {});
  }, []);

  async function loadBooks(filter) {
    setLoading(true);
    setError(null);
    try {
      const data = await booksApi.list(filter);
      setBooks(data);
    } catch (err) {
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
        <h1>Books</h1>
        <Link to="/books/new" className="btn btn-primary">
          + Add Book
        </Link>
      </div>

      <form className="filter-bar" onSubmit={handleFilter}>
        <input
          type="text"
          placeholder="Search title or author..."
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
        <button type="submit" className="btn btn-secondary">
          Filter
        </button>
        <button type="button" className="btn btn-ghost" onClick={clearFilters}>
          Clear
        </button>
      </form>

      {error && <p className="error-banner">{error}</p>}
      {loading ? (
        <p>Loading books…</p>
      ) : books.length === 0 ? (
        <p className="empty-state">No books match your filters yet.</p>
      ) : (
        <div className="book-grid">
          {books.map((book) => (
            <Link to={`/books/${book.id}`} key={book.id} className="book-card">
              <div className="book-cover">
                {book.coverImagePath ? (
                  <img src={coverImageUrl(book.coverImagePath)} alt={book.title} />
                ) : (
                  <div className="cover-placeholder">No Cover</div>
                )}
                <span className={`status-badge status-${book.status.toLowerCase()}`}>
                  {book.status}
                </span>
              </div>
              <div className="book-card-body">
                <h3>{book.title}</h3>
                <p className="muted">{book.author}</p>
                <div className="book-meta">
                  <span>{book.genre}</span>
                  <span>${book.price.toFixed(2)}</span>
                </div>
                <Stars value={book.rating} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
