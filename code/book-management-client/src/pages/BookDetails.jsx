import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { booksApi, coverImageUrl } from "../api/client";
import Stars from "../components/Stars";
import CheckoutForm from "../components/CheckoutForm";
import { useAuth } from "../context/AuthContext";

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [order, setOrder] = useState(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    booksApi
      .getById(id)
      .then(setBook)
      .catch(() => setNotFound(true));
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await booksApi.remove(id);
      navigate("/");
    } finally {
      setDeleting(false);
    }
  }

  function handlePurchased(placedOrder) {
    setOrder(placedOrder);
    setShowCheckout(false);
    setBook((b) => ({ ...b, status: "Sold" }));
  }

  if (notFound) return <p className="error-banner">⚠️ Book not found.</p>;
  if (!book)
    return (
      <div className="loading-spinner">
        <div className="spinner-ring" />
        Loading book…
      </div>
    );

  return (
    <div className="details-page">
      <Link to="/" className="back-link">
        ← Back to books
      </Link>

      {order && (
        <div className="order-confirmation">
          🎉 Order placed! A confirmation for <strong>{order.bookTitle}</strong> was sent to {order.email}.
        </div>
      )}

      <div className="details-card">
        <div className="details-cover">
          {book.coverImagePath ? (
            <img src={coverImageUrl(book.coverImagePath)} alt={book.title} />
          ) : (
            <div className="cover-placeholder large">
              <span className="cover-placeholder-icon">📖</span>
              No Cover
            </div>
          )}
        </div>

        <div className="details-body">
          <h1>{book.title}</h1>
          <p className="muted">by {book.author}</p>
          <Stars value={book.rating} />

          <div className="price-display">₹{book.price.toFixed(2)}</div>

          <dl className="details-grid">
            <dt>Published</dt>
            <dd>{book.publishedYear}</dd>
            <dt>Genre</dt>
            <dd>{book.genre}</dd>
            <dt>Status</dt>
            <dd>
              <span className={`status-badge status-${book.status.toLowerCase()} static`}>
                {book.status}
              </span>
            </dd>
            <dt>ISBN</dt>
            <dd>{book.isbn || "—"}</dd>
            <dt>Publisher</dt>
            <dd>{book.publisher || "—"}</dd>
          </dl>

          <div className="form-actions">
            {book.status !== "Sold" && (
              <button className="btn btn-buy" onClick={() => setShowCheckout(true)}>
                🛒 Buy — ₹{book.price.toFixed(2)}
              </button>
            )}

            {isAdmin() && (
              <>
                <Link to={`/books/${book.id}/edit`} className="btn btn-secondary">
                  ✏️ Edit
                </Link>
                {!confirmingDelete ? (
                  <button className="btn btn-danger" onClick={() => setConfirmingDelete(true)}>
                    🗑️ Delete
                  </button>
                ) : (
                  <span className="confirm-delete">
                    Delete permanently?
                    <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
                      {deleting ? "Deleting…" : "Yes, delete"}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setConfirmingDelete(false)}>
                      Cancel
                    </button>
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showCheckout && (
        <CheckoutForm
          book={book}
          onClose={() => setShowCheckout(false)}
          onPurchased={handlePurchased}
        />
      )}
    </div>
  );
}
