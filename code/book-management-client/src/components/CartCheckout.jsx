import { useState } from "react";
import { Link } from "react-router-dom";
import { booksApi } from "../api/client";
import { coverImageUrl } from "../api/client";

// ─── Field Error Helper ─────────────────────────────────────────
function FieldError({ errors, field }) {
  const msg = errors?.[field]?.[0];
  if (!msg) return null;
  return <span className="field-error">{msg}</span>;
}

// ─── Step Progress Bar ──────────────────────────────────────────
function StepBar({ step, total = 3 }) {
  const labels = ["Review Cart", "Shipping", "Payment"];
  return (
    <div className="checkout-step-bar">
      {labels.map((label, i) => (
        <div key={i} className={`checkout-step-item ${i + 1 <= step ? "done" : ""} ${i + 1 === step ? "current" : ""}`}>
          <div className="checkout-step-circle">{i + 1 < step ? "✓" : i + 1}</div>
          <span className="checkout-step-label">{label}</span>
          {i < total - 1 && <div className={`checkout-step-line ${i + 1 < step ? "done" : ""}`} />}
        </div>
      ))}
    </div>
  );
}

const emptyForm = {
  customerName: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postalCode: "",
  country: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvc: "",
};

export default function CartCheckout({ cart, cartTotal, clearCart, onCancel }) {
  const [step, setStep] = useState(1); // 1=review, 2=shipping, 3=payment, 4=success
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState([]);
  const [failedBooks, setFailedBooks] = useState([]);

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => {
      const next = { ...e };
      delete next[field];
      delete next[field.charAt(0).toUpperCase() + field.slice(1)];
      return next;
    });
  }

  function validateShipping() {
    const errs = {};
    if (!form.customerName.trim()) errs.customerName = ["Full name is required."];
    if (!form.email.trim()) errs.email = ["Email is required."];
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = ["Enter a valid email."];
    if (!form.addressLine1.trim()) errs.addressLine1 = ["Address is required."];
    if (!form.city.trim()) errs.city = ["City is required."];
    if (!form.postalCode.trim()) errs.postalCode = ["Postal code is required."];
    if (!form.country.trim()) errs.country = ["Country is required."];
    return errs;
  }

  function validatePayment() {
    const errs = {};
    const rawCard = form.cardNumber.replace(/\s/g, "");
    if (!rawCard || rawCard.length < 13) errs.cardNumber = ["Enter a valid card number."];
    if (!form.cardExpiry || form.cardExpiry.length < 5) errs.cardExpiry = ["Enter expiry as MM/YY."];
    if (!form.cardCvc || form.cardCvc.length < 3) errs.cardCvc = ["Enter a valid CVC."];
    return errs;
  }

  function goToShipping(e) {
    e.preventDefault();
    setStep(2);
  }

  function goToPayment(e) {
    e.preventDefault();
    const errs = validateShipping();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep(3);
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    const errs = validatePayment();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    setErrors({});

    try {
      // Single API call — buys ALL books in the cart atomically.
      // The backend handles any number of books in one SaveChanges commit.
      const bookIds = cart.map((b) => b.id);
      const result = await booksApi.buyCart(bookIds, form);

      // Enrich succeeded orders with client-side price/author for the receipt
      const enriched = result.succeeded.map((order) => {
        const original = cart.find((b) => b.id === order.bookId);
        return { ...order, price: original?.price ?? order.pricePaid, bookAuthor: original?.author ?? "" };
      });

      setOrders(enriched);
      setFailedBooks(result.failed ?? []);
      clearCart();
      setStep(4);
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        setErrors(apiErrors);
      } else {
        setErrors({ _general: "Checkout failed. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Step 4: Order Success ──────────────────────────────────────
  if (step === 4) {
    const total = orders.reduce((s, o) => s + (o.price || 0), 0);
    return (
      <div className="checkout-page">
        <div className="checkout-success-wrap">
          <div className="checkout-success-icon">🎉</div>
          <h2 className="checkout-success-title">Order Confirmed!</h2>
          <p className="checkout-success-sub">
            A confirmation email has been sent to <strong>{form.email}</strong>
          </p>

          {failedBooks.length > 0 && (
            <div className="error-banner" style={{ textAlign: "left", marginBottom: 20 }}>
              ⚠️ {failedBooks.length} book(s) could not be purchased:
              <ul style={{ margin: "8px 0 0 16px" }}>
                {failedBooks.map((b) => <li key={b.id}>{b.title} — {b.reason}</li>)}
              </ul>
            </div>
          )}

          <div className="checkout-success-card">
            <div className="checkout-success-card-header">
              <span>Your Order</span>
              <span>{orders.length} item{orders.length !== 1 ? "s" : ""}</span>
            </div>
            {orders.map((o, i) => (
              <div key={i} className="checkout-success-item">
                <span className="checkout-success-item-title">{o.bookTitle}</span>
                <span className="checkout-success-item-price">₹{(o.price || 0).toFixed(2)}</span>
              </div>
            ))}
            <div className="checkout-success-total">
              <span>Total Paid</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="checkout-success-address">
            <div className="checkout-success-address-label">Shipping To</div>
            <div>{form.customerName}</div>
            <div>{form.addressLine1}{form.addressLine2 ? `, ${form.addressLine2}` : ""}</div>
            <div>{form.city}, {form.postalCode}</div>
            <div>{form.country}</div>
          </div>

          <Link to="/" className="btn btn-primary" style={{ marginTop: "1.5rem", width: "100%" }}>
            ← Back to Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-layout">
        {/* ─── Left Panel ──────────────────────────────────────── */}
        <div className="checkout-main">
          <div className="checkout-header">
            <h2 className="checkout-title">
              {step === 1 && "🛍️ Review Your Cart"}
              {step === 2 && "📦 Shipping Details"}
              {step === 3 && "💳 Payment Info"}
            </h2>
          </div>

          <StepBar step={step} />

          {errors._general && (
            <p className="error-banner" style={{ marginBottom: 16 }}>⚠️ {errors._general}</p>
          )}

          {/* ─── Step 1: Review Cart ─────────────────────────── */}
          {step === 1 && (
            <div className="checkout-step-body">
              <div className="checkout-review-list">
                {cart.map((book) => (
                  <div key={book.id} className="checkout-review-item">
                    <div className="checkout-review-cover">
                      {book.coverImagePath
                        ? <img src={coverImageUrl(book.coverImagePath)} alt={book.title} />
                        : <div className="cover-placeholder small">📖</div>
                      }
                    </div>
                    <div className="checkout-review-info">
                      <div className="checkout-review-title">{book.title}</div>
                      <div className="checkout-review-author">by {book.author}</div>
                      {book.genre && <span className="book-genre-tag">{book.genre}</span>}
                    </div>
                    <div className="checkout-review-price">₹{book.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="checkout-step-actions">
                <button className="btn btn-ghost" onClick={onCancel}>← Back to Cart</button>
                <button className="btn btn-primary" onClick={goToShipping}>
                  Continue to Shipping →
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 2: Shipping ───────────────────────────── */}
          {step === 2 && (
            <form onSubmit={goToPayment} className="book-form checkout-form" noValidate>
              <div className="checkout-section-label">Contact Info</div>

              <label>
                Full Name
                <input
                  value={form.customerName}
                  onChange={(e) => handleChange("customerName", e.target.value)}
                  placeholder="Jane Doe"
                  autoFocus
                />
                <FieldError errors={errors} field="customerName" />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="jane@example.com"
                />
                <FieldError errors={errors} field="email" />
              </label>

              <div className="checkout-section-label" style={{ marginTop: 8 }}>Shipping Address</div>

              <label>
                Address Line 1
                <input
                  value={form.addressLine1}
                  onChange={(e) => handleChange("addressLine1", e.target.value)}
                  placeholder="123 Main Street"
                />
                <FieldError errors={errors} field="addressLine1" />
              </label>

              <label>
                Address Line 2 <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                <input
                  value={form.addressLine2}
                  onChange={(e) => handleChange("addressLine2", e.target.value)}
                  placeholder="Apt, suite, floor..."
                />
              </label>

              <div className="form-row">
                <label>
                  City
                  <input
                    value={form.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="Mumbai"
                  />
                  <FieldError errors={errors} field="city" />
                </label>
                <label>
                  Postal Code
                  <input
                    value={form.postalCode}
                    onChange={(e) => handleChange("postalCode", e.target.value)}
                    placeholder="400001"
                  />
                  <FieldError errors={errors} field="postalCode" />
                </label>
              </div>

              <label>
                Country
                <input
                  value={form.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  placeholder="India"
                />
                <FieldError errors={errors} field="country" />
              </label>

              <div className="checkout-step-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn btn-primary">Continue to Payment →</button>
              </div>
            </form>
          )}

          {/* ─── Step 3: Payment ─────────────────────────────── */}
          {step === 3 && (
            <form onSubmit={handlePlaceOrder} className="book-form checkout-form" noValidate>
              <div className="demo-notice">
                <span className="demo-notice-icon">⚠️</span>
                <span>Demo checkout — no real payment is processed. Card details are never stored.</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div className="checkout-section-label">Card Details</div>
                <div className="payment-card-icons">
                  <span className="card-icon">VISA</span>
                  <span className="card-icon">MC</span>
                  <span className="card-icon">AMEX</span>
                </div>
              </div>

              <label>
                Card Number
                <input
                  placeholder="4242 4242 4242 4242"
                  value={form.cardNumber}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\s/g, "").slice(0, 16);
                    const formatted = raw.replace(/(.{4})/g, "$1 ").trim();
                    handleChange("cardNumber", formatted);
                  }}
                  maxLength={19}
                  inputMode="numeric"
                  autoFocus
                />
                <FieldError errors={errors} field="cardNumber" />
              </label>

              <div className="form-row">
                <label>
                  Expiry Date
                  <input
                    placeholder="MM/YY"
                    value={form.cardExpiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "").slice(0, 4);
                      if (val.length >= 3) val = val.slice(0, 2) + "/" + val.slice(2);
                      handleChange("cardExpiry", val);
                    }}
                    maxLength={5}
                    inputMode="numeric"
                  />
                  <FieldError errors={errors} field="cardExpiry" />
                </label>
                <label>
                  CVC
                  <input
                    placeholder="123"
                    value={form.cardCvc}
                    onChange={(e) => handleChange("cardCvc", e.target.value.replace(/\D/g, "").slice(0, 4))}
                    maxLength={4}
                    inputMode="numeric"
                  />
                  <FieldError errors={errors} field="cardCvc" />
                </label>
              </div>

              <div className="checkout-step-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                <button type="submit" className="btn btn-buy" disabled={submitting} style={{ flex: 1 }}>
                  {submitting ? (
                    <>
                      <span className="spinner-ring" style={{ width: 16, height: 16, borderWidth: 2 }} />
                      Placing Order…
                    </>
                  ) : (
                    `🔒 Pay ₹${cartTotal.toFixed(2)}`
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ─── Right Panel: Order Summary ───────────────────────── */}
        <div className="checkout-sidebar">
          <div className="checkout-sidebar-card">
            <h3 className="checkout-sidebar-title">Order Summary</h3>
            <div className="checkout-sidebar-items">
              {cart.map((book) => (
                <div key={book.id} className="checkout-sidebar-item">
                  <div className="checkout-sidebar-item-cover">
                    {book.coverImagePath
                      ? <img src={coverImageUrl(book.coverImagePath)} alt={book.title} />
                      : <div className="cover-placeholder small" style={{ fontSize: "0.8rem" }}>📖</div>
                    }
                  </div>
                  <div className="checkout-sidebar-item-info">
                    <div className="checkout-sidebar-item-title">{book.title}</div>
                    <div className="checkout-sidebar-item-author">{book.author}</div>
                  </div>
                  <div className="checkout-sidebar-item-price">₹{book.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="checkout-sidebar-divider" />
            <div className="checkout-sidebar-row">
              <span>Subtotal ({cart.length} items)</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="checkout-sidebar-row">
              <span>Shipping</span>
              <span style={{ color: "var(--green)" }}>Free</span>
            </div>
            <div className="checkout-sidebar-divider" />
            <div className="checkout-sidebar-total">
              <span>Total</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="checkout-sidebar-trust">
              <div>🔒 Secure Checkout</div>
              <div>📦 Free Delivery</div>
              <div>↩️ Easy Returns</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
