import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { booksApi, coverImageUrl } from "../api/client";
import Stars from "../components/Stars";
import { useAuth } from "../context/AuthContext";
import { useSelection } from "../context/SelectionContext";

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
  const { isInCart, addToCart, removeFromCart, isInFavorites, addToFavorites, removeFromFavorites } = useSelection();

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

  // Curated fallback items if library is still loading
  const showcaseBooks = books.length >= 3 ? books.slice(0, 7) : [
    { id: "feat-1", title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Classic Fiction", rating: 4.8, price: 15.00 },
    { id: "feat-2", title: "A Brief History of Time", author: "Stephen Hawking", genre: "Science & Cosmos", rating: 4.9, price: 19.50 },
    { id: "feat-3", title: "Meditations", author: "Marcus Aurelius", genre: "Philosophy", rating: 4.9, price: 12.00 },
    { id: "feat-4", title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Drama", rating: 4.9, price: 14.50 },
    { id: "feat-5", title: "Clean Code", author: "Robert C. Martin", genre: "Technology", rating: 4.7, price: 24.00 },
  ];

  return (
    <div className="books-page-wrap">
      {/* ─── 3D Slider Interactive Showcase ────────────────────── */}
      <div className="hero-3d-banner">
        <div className="hero-3d-content">
          <h1 className="hero-3d-title">
            Experience different books based on your genre and styles
          </h1>
          <p className="hero-3d-desc">
            Explore curated titles across fiction, science, history, philosophy, and modern literature in real-time.
          </p>

          <div className="hero-3d-stats">
            <div className="hero-stat-card">
              <span className="hero-stat-num">{books.length || 12}+</span>
              <span className="hero-stat-label">Volumes</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-num">{options.genres.length || 6}</span>
              <span className="hero-stat-label">Genres</span>
            </div>
            <div className="hero-stat-card">
              <span className="hero-stat-num">24/7</span>
              <span className="hero-stat-label">Digital Desk</span>
            </div>
          </div>

          <div className="hero-3d-actions">
            {isAdmin() && (
              <Link to="/books/new" className="btn btn-primary hero-btn">
                ＋ Add New Volume
              </Link>
            )}
            <a href="#catalog-section" className="btn btn-ghost hero-btn-secondary">
              Explore Catalog ↓
            </a>
          </div>
        </div>

        {/* ── 3D Book Slider Stage ── */}
        <Book3DSlider items={showcaseBooks} />
      </div>

      <div className="page-header" id="catalog-section">
        <div className="page-header-left">
          <h2 className="page-title">Catalog Inventory</h2>
          <p className="page-subtitle">Search, filter, and inspect physical &amp; digital books</p>
        </div>
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
                <div className="card-quick-actions">
                  <button 
                    className={`quick-action-btn ${isInFavorites(book.id) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      isInFavorites(book.id) ? removeFromFavorites(book.id) : addToFavorites(book);
                    }}
                    title={isInFavorites(book.id) ? "Remove from Favorites" : "Add to Favorites"}
                  >
                    ❤️
                  </button>
                  <button 
                    className={`quick-action-btn ${isInCart(book.id) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      isInCart(book.id) ? removeFromCart(book.id) : addToCart(book);
                    }}
                    title={isInCart(book.id) ? "Remove from Cart" : "Add to Cart"}
                  >
                    🛒
                  </button>
                </div>
              </div>
              <div className="book-card-body">
                <h3>{book.title}</h3>
                <p className="muted">{book.author}</p>
                <Stars value={book.rating} />
                <div className="book-meta">
                  <span className="book-genre-tag">{book.genre}</span>
                  <span className="book-price">₹{book.price.toFixed(2)}</span>
                </div>
                <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                  <button 
                    className={`btn btn-sm ${isInCart(book.id) ? 'btn-secondary' : 'btn-primary'}`} 
                    style={{ flex: 1, padding: "6px" }}
                    onClick={(e) => {
                      e.preventDefault();
                      isInCart(book.id) ? removeFromCart(book.id) : addToCart(book);
                    }}
                  >
                    {isInCart(book.id) ? 'In Cart' : 'Add to Cart'}
                  </button>
                  <button 
                    className={`btn btn-sm ${isInFavorites(book.id) ? 'btn-secondary' : 'btn-ghost'}`} 
                    style={{ padding: "6px 10px" }}
                    onClick={(e) => {
                      e.preventDefault();
                      isInFavorites(book.id) ? removeFromFavorites(book.id) : addToFavorites(book);
                    }}
                    title={isInFavorites(book.id) ? "Remove from Favorites" : "Add to Favorites"}
                  >
                    {isInFavorites(book.id) ? '❤️' : '🤍'}
                  </button>
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
              <div className="row-quick-actions" style={{ display: "flex", gap: "8px" }}>
                <button 
                  className={`btn btn-sm ${isInCart(book.id) ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    isInCart(book.id) ? removeFromCart(book.id) : addToCart(book);
                  }}
                  title="Cart"
                >
                  {isInCart(book.id) ? 'In Cart' : '🛒 Add'}
                </button>
                <button 
                  className={`btn btn-sm ${isInFavorites(book.id) ? 'btn-secondary' : 'btn-ghost'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    isInFavorites(book.id) ? removeFromFavorites(book.id) : addToFavorites(book);
                  }}
                  title="Favorites"
                >
                  {isInFavorites(book.id) ? '❤️' : '🤍'}
                </button>
              </div>
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

function Book3DSlider({ items }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto slide every 3.8 seconds when not hovered
  useEffect(() => {
    if (isHovered || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isHovered, items.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const activeBook = items[currentIndex] || items[0];

  return (
    <div
      className="slider-3d-stage"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Atmospheric Ambient Glow */}
      <div className="slider-3d-glow" aria-hidden="true" />

      {/* 3D Carousel Track */}
      <div className="slider-3d-track">
        {items.map((book, idx) => {
          // Calculate cyclic offset
          const count = items.length;
          let offset = (idx - currentIndex + count) % count;
          if (offset > count / 2) offset -= count;

          const isActive = offset === 0;
          const isPrev = offset === -1;
          const isNext = offset === 1;
          const isVisible = Math.abs(offset) <= 2;

          if (!isVisible) return null;

          const hasCover = !!book.coverImagePath;

          return (
            <div
              key={book.id || idx}
              className={`slider-3d-card ${isActive ? "active-slide" : ""} ${isPrev ? "prev-slide" : ""} ${isNext ? "next-slide" : ""}`}
              onClick={() => setCurrentIndex(idx)}
              style={{
                "--offset": offset,
                zIndex: 10 - Math.abs(offset),
              }}
            >
              {/* 3D Book Volume Assembly */}
              <div className="book-3d-volume">
                {/* Front Cover */}
                <div className="book-3d-front">
                  {hasCover ? (
                    <img
                      src={coverImageUrl(book.coverImagePath)}
                      alt={book.title}
                      className="book-3d-cover-img"
                    />
                  ) : (
                    <div
                      className="book-3d-leather-cover"
                      style={{
                        background:
                          idx % 3 === 0
                            ? "linear-gradient(135deg, #075e54 0%, #008069 60%, #0a4037 100%)"
                            : idx % 3 === 1
                            ? "linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #172554 100%)"
                            : "linear-gradient(135deg, #78350f 0%, #d97706 60%, #451a03 100%)",
                      }}
                    >
                      <div className="book-3d-crest">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                          <path d="M6 6h10" />
                          <path d="M6 10h10" />
                        </svg>
                      </div>
                      <div className="book-3d-title-block">
                        <div className="book-3d-title">{book.title}</div>
                        <div className="book-3d-author">{book.author}</div>
                      </div>
                      <div className="book-3d-seal-tag">{book.genre}</div>
                    </div>
                  )}
                  <div className="book-3d-glare" />
                </div>

                {/* 3D Spine */}
                <div className="book-3d-spine">
                  <div className="book-3d-spine-ribs" />
                  <span className="book-3d-spine-text">{book.title}</span>
                  <div className="book-3d-spine-ribs" />
                </div>

                {/* 3D Pages */}
                <div className="book-3d-pages">
                  <div className="book-3d-page-texture" />
                </div>

                {/* 3D Back Cover */}
                <div className="book-3d-back" />

                {/* 3D Ribbon */}
                {isActive && <div className="book-3d-ribbon" />}
              </div>

              {/* 3D Dynamic Ambient Shadow */}
              <div className="slider-3d-shadow" />
            </div>
          );
        })}
      </div>

      {/* Slider Navigation Arrows */}
      <button
        type="button"
        className="slider-arrow slider-arrow-prev"
        onClick={handlePrev}
        aria-label="Previous Book"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <button
        type="button"
        className="slider-arrow slider-arrow-next"
        onClick={handleNext}
        aria-label="Next Book"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Active Book Info Bar */}
      {activeBook && (
        <div className="slider-active-meta">
          <div className="slider-meta-left">
            <span className="slider-meta-genre">{activeBook.genre}</span>
            <h3 className="slider-meta-title">{activeBook.title}</h3>
            <p className="slider-meta-author">by {activeBook.author}</p>
          </div>
          <div className="slider-meta-right">
            {activeBook.rating && <Stars value={activeBook.rating} />}
            <Link to={`/books/${activeBook.id}`} className="slider-inspect-link">
              View Book →
            </Link>
          </div>
        </div>
      )}

      {/* Slider Dot Indicators */}
      <div className="slider-dots-bar">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`slider-dot ${i === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(i)}
            aria-label={`Go to book ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
