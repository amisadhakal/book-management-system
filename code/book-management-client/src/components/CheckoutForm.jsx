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

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
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
        <div className="modal-header">
          <h2>Checkout</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="checkout-summary">
          <span>{book.title}</span>
          <strong>${book.price.toFixed(2)}</strong>
        </div>

        <form onSubmit={handleSubmit} className="book-form">
          {errors._general && <p className="error-banner">{errors._general}</p>}

          <label>
            Full Name
            <input value={form.customerName} onChange={(e) => handleChange("customerName", e.target.value)} required />
            <FieldError errors={errors} field="CustomerName" />
          </label>

          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} required />
            <FieldError errors={errors} field="Email" />
          </label>

          <label>
            Address Line 1
            <input value={form.addressLine1} onChange={(e) => handleChange("addressLine1", e.target.value)} required />
            <FieldError errors={errors} field="AddressLine1" />
          </label>

          <label>
            Address Line 2 (optional)
            <input value={form.addressLine2} onChange={(e) => handleChange("addressLine2", e.target.value)} />
          </label>

          <div className="form-row">
            <label>
              City
              <input value={form.city} onChange={(e) => handleChange("city", e.target.value)} required />
              <FieldError errors={errors} field="City" />
            </label>
            <label>
              Postal Code
              <input value={form.postalCode} onChange={(e) => handleChange("postalCode", e.target.value)} required />
              <FieldError errors={errors} field="PostalCode" />
            </label>
          </div>

          <label>
            Country
            <input value={form.country} onChange={(e) => handleChange("country", e.target.value)} required />
            <FieldError errors={errors} field="Country" />
          </label>

          <hr className="divider" />
          <p className="muted small">
            💳 This is a demo checkout — no real payment is processed and card details are never stored.
          </p>

          <label>
            Card Number
            <input
              placeholder="4242 4242 4242 4242"
              value={form.cardNumber}
              onChange={(e) => handleChange("cardNumber", e.target.value)}
              required
            />
            <FieldError errors={errors} field="CardNumber" />
          </label>

          <div className="form-row">
            <label>
              Expiry
              <input placeholder="MM/YY" value={form.cardExpiry} onChange={(e) => handleChange("cardExpiry", e.target.value)} required />
              <FieldError errors={errors} field="CardExpiry" />
            </label>
            <label>
              CVC
              <input placeholder="123" value={form.cardCvc} onChange={(e) => handleChange("cardCvc", e.target.value)} required />
              <FieldError errors={errors} field="CardCvc" />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Placing order…" : `Pay $${book.price.toFixed(2)}`}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldError({ errors, field }) {
  const msg = errors?.[field]?.[0];
  if (!msg) return null;
  return <span className="field-error">{msg}</span>;
}
