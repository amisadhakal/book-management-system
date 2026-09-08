import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelection } from "../context/SelectionContext";
import { coverImageUrl } from "../api/client";
import CartCheckout from "../components/CartCheckout";

export default function Cart() {
  const { cart, removeFromCart, cartTotal, clearCart } = useSelection();
  const [checkingOut, setCheckingOut] = useState(false);

  if (checkingOut) {
    return (
      <CartCheckout
        cart={cart}
        cartTotal={cartTotal}
        clearCart={clearCart}
        onCancel={() => setCheckingOut(false)}
      />
    );
  }

  return (
    <div className="books-page-wrap">
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">Your Cart</h2>
          <p className="page-subtitle">Review items in your cart before checkout</p>
        </div>
        {cart.length > 0 && (
          <Link to="/" className="btn btn-ghost btn-sm">
            ← Continue Shopping
          </Link>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">🛒</span>
          <p>Your cart is empty.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="cart-container">
          <div className="cart-list">
            {cart.map((book) => (
              <div key={book.id} className="cart-item">
                <div className="cart-item-cover">
                  {book.coverImagePath ? (
                    <img src={coverImageUrl(book.coverImagePath)} alt={book.title} loading="lazy" />
                  ) : (
                    <div className="cover-placeholder small">📖</div>
                  )}
                </div>
                <div className="cart-item-details">
                  <h3>{book.title}</h3>
                  <p className="muted">{book.author}</p>
                  {book.genre && <span className="book-genre-tag" style={{ marginTop: 6 }}>{book.genre}</span>}
                  <div className="cart-item-price">₹{book.price.toFixed(2)}</div>
                </div>
                <div className="cart-item-actions">
                  <Link to={`/books/${book.id}`} className="btn btn-ghost btn-sm">
                    View
                  </Link>
                  <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(book.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Items ({cart.length})</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span style={{ color: "var(--green)", fontWeight: 600 }}>Free</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>

            <button
              className="btn btn-primary"
              style={{ marginTop: "1.25rem", width: "100%", padding: "12px" }}
              onClick={() => setCheckingOut(true)}
            >
              🔒 Proceed to Checkout
            </button>

            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: "8px", width: "100%" }}
              onClick={() => { if (window.confirm("Clear all items from your cart?")) clearCart(); }}
            >
              🗑️ Clear Cart
            </button>

            <div className="cart-trust-badges">
              <span>🔒 Secure</span>
              <span>📦 Free Shipping</span>
              <span>↩️ Easy Returns</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
