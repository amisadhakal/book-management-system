import { Link } from "react-router-dom";
import { useSelection } from "../context/SelectionContext";
import { coverImageUrl } from "../api/client";
import Stars from "../components/Stars";

export default function Favorites() {
  const { favorites, removeFromFavorites } = useSelection();

  return (
    <div className="books-page-wrap">
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">Your Favorites</h2>
          <p className="page-subtitle">Books you have saved for later</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">❤️</span>
          You have no favorites yet.
        </div>
      ) : (
        <div className="book-grid">
          {favorites.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-cover">
                {book.coverImagePath ? (
                  <img src={coverImageUrl(book.coverImagePath)} alt={book.title} loading="lazy" />
                ) : (
                  <div className="cover-placeholder">
                    <span className="cover-placeholder-icon">📖</span>
                    No Cover
                  </div>
                )}
                <button 
                  className="favorite-btn active" 
                  onClick={(e) => { e.preventDefault(); removeFromFavorites(book.id); }}
                  title="Remove from Favorites"
                >
                  ❤️
                </button>
              </div>
              <div className="book-card-body">
                <h3>{book.title}</h3>
                <p className="muted">{book.author}</p>
                <Stars value={book.rating} />
                <div className="book-meta">
                  <span className="book-genre-tag">{book.genre}</span>
                  <span className="book-price">₹{book.price.toFixed(2)}</span>
                </div>
                <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                  <Link to={`/books/${book.id}`} className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: "center" }}>
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
