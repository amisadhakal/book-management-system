import { useState } from "react";
import { booksApi } from "../api/client";

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

export default function CheckoutForm({ book, onClose, onPurchased }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1 = shipping, 2 = payment

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    // clear field error on change
    if (errors[field] || errors[capitalize(field)]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[field];
        delete next[capitalize(field)];
        return next;
      });
    }
  }

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
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

  function handleNextStep(e) {
    e.preventDefault();
    const errs = validateShipping();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep(2);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      const order = await booksApi.buy(book.id, form);
      onPurchased(order);
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        setErrors(apiErrors);
      } else if (err.response?.status === 409) {
        setErrors({ _general: "This book was just sold to someone else." });
      } else {
        setErrors({ _general: "Checkout failed. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal checkout-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>
              {step === 1 ? "🛍️ Checkout" : "💳 Payment"}
            </h2>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>
              Step {step} of 2 — {step === 1 ? "Shipping Details" : "Payment Info"}
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 4, padding: "12px 24px 0" }}>
          {[1, 2].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 99,
                background: s <= step ? "var(--primary)" : "var(--border)",
                transition: "background 0.3s ease",
              }}
            />
          ))}
        </div>

        {/* Order summary */}
        <div className="checkout-summary">
          <div>
            <div className="checkout-summary-title">{book.title}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>
              by {book.author}
            </div>
          </div>
          <div className="checkout-summary-price">₹{book.price.toFixed(2)}</div>
        </div>

        {errors._general && (
          <div style={{ padding: "0 24px" }}>
            <p className="error-banner">{errors._general}</p>
          </div>
        )}

        {/* Step 1: Shipping */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="book-form" noValidate>
            <div className="checkout-section-label">Contact Info</div>

            <label>
              Full Name
              <input
                value={form.customerName}
                onChange={(e) => handleChange("customerName", e.target.value)}
                placeholder="John Doe"
                autoFocus
              />
              <FieldError errors={errors} field="customerName" />
              <FieldError errors={errors} field="CustomerName" />
            </label>

            <label>
              Email Address
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="john@example.com"
              />
              <FieldError errors={errors} field="email" />
              <FieldError errors={errors} field="Email" />
            </label>

            <div className="checkout-section-label" style={{ marginTop: 4 }}>Shipping Address</div>

            <label>
              Address Line 1
              <input
                value={form.addressLine1}
                onChange={(e) => handleChange("addressLine1", e.target.value)}
                placeholder="123 Main Street"
              />
              <FieldError errors={errors} field="addressLine1" />
              <FieldError errors={errors} field="AddressLine1" />
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
                  placeholder="New York"
                />
                <FieldError errors={errors} field="city" />
                <FieldError errors={errors} field="City" />
              </label>
              <label>
                Postal Code
                <input
                  value={form.postalCode}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                  placeholder="10001"
                />
                <FieldError errors={errors} field="postalCode" />
                <FieldError errors={errors} field="PostalCode" />
              </label>
            </div>

            <label>
              Country
              <input
                value={form.country}
                onChange={(e) => handleChange("country", e.target.value)}
                placeholder="United States"
              />
              <FieldError errors={errors} field="country" />
              <FieldError errors={errors} field="Country" />
            </label>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                Continue to Payment →
              </button>
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="book-form" noValidate>
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
                  // format with spaces
                  const raw = e.target.value.replace(/\s/g, "").slice(0, 16);
                  const formatted = raw.replace(/(.{4})/g, "$1 ").trim();
                  handleChange("cardNumber", formatted);
                }}
                maxLength={19}
                inputMode="numeric"
                autoFocus
              />
              <FieldError errors={errors} field="CardNumber" />
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
                <FieldError errors={errors} field="CardExpiry" />
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
                <FieldError errors={errors} field="CardCvc" />
              </label>
            </div>

            <hr className="divider" />

            {/* Order total */}
            <div style={{
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.15)",
              borderRadius: "var(--radius-sm)",
              padding: "14px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 600 }}>ORDER TOTAL</div>
                <div style={{ fontWeight: 800, fontSize: "1.4rem", color: "var(--primary-light)", letterSpacing: "-0.02em" }}>
                  ₹{book.price.toFixed(2)}
                </div>
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--muted)", textAlign: "right" }}>
                <div>📦 Free shipping</div>
                <div>🔒 Secure checkout</div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setStep(1)}
                style={{ flexShrink: 0 }}
              >
                ← Back
              </button>
              <button
                type="submit"
                className="btn btn-buy"
                disabled={submitting}
                style={{ flex: 1 }}
              >
                {submitting ? (
                  <>
                    <span className="spinner-ring" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Placing Order…
                  </>
                ) : (
                  `🔒 Pay ₹${book.price.toFixed(2)}`
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function FieldError({ errors, field }) {
  const msg = errors?.[field]?.[0];
  if (!msg) return null;
  return <span className="field-error">{msg}</span>;
}
