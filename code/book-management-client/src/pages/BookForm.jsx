import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { booksApi, coverImageUrl } from "../api/client";

const emptyBook = {
  title: "",
  author: "",
  price: "",
  publishedYear: new Date().getFullYear(),
  genre: "",
  status: "",
  isbn: "",
  publisher: "",
  rating: 0,
  coverImagePath: "",
};

export default function BookForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [book, setBook] = useState(emptyBook);
  const [options, setOptions] = useState({ genres: [], statuses: [] });
  const [coverFile, setCoverFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    booksApi.getOptions().then((opts) => {
      setOptions(opts);
      setBook((b) => (isEdit ? b : { ...b, genre: opts.genres[0]?.value ?? "", status: opts.statuses[0]?.value ?? "" }));
    });
  }, [isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    booksApi.getById(id).then((data) => {
      setBook(data);
      setLoading(false);
    });
  }, [id, isEdit]);

  function handleChange(field, value) {
    setBook((b) => ({ ...b, [field]: value }));
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    setCoverFile(file || null);
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const payload = {
        ...book,
        id: isEdit ? Number(id) : undefined,
        price: Number(book.price),
        publishedYear: Number(book.publishedYear),
        rating: Number(book.rating),
      };
      if (isEdit) {
        await booksApi.update(id, payload, coverFile);
      } else {
        await booksApi.create(payload, coverFile);
      }
      navigate("/");
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        setErrors(apiErrors);
      } else {
        setErrors({ _general: "Something went wrong saving the book. Check the API is running." });
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading…</p>;

  return (
    <div className="form-page">
      <h1>{isEdit ? "Edit Book" : "Add Book"}</h1>
      <form onSubmit={handleSubmit} className="book-form">
        {errors._general && <p className="error-banner">{errors._general}</p>}

        <label>
          Title
          <input value={book.title} onChange={(e) => handleChange("title", e.target.value)} required />
          <FieldError errors={errors} field="Title" />
        </label>

        <label>
          Author
          <input value={book.author} onChange={(e) => handleChange("author", e.target.value)} required />
          <FieldError errors={errors} field="Author" />
        </label>

        <div className="form-row">
          <label>
            Price ($)
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={book.price}
              onChange={(e) => handleChange("price", e.target.value)}
              required
            />
            <FieldError errors={errors} field="Price" />
          </label>

          <label>
            Published Year
            <input
              type="number"
              value={book.publishedYear}
              onChange={(e) => handleChange("publishedYear", e.target.value)}
              required
            />
            <FieldError errors={errors} field="PublishedYear" />
          </label>
        </div>

        <div className="form-row">
          <label>
            Genre
            <select value={book.genre} onChange={(e) => handleChange("genre", e.target.value)} required>
              {options.genres.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select value={book.status} onChange={(e) => handleChange("status", e.target.value)} required>
              {options.statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-row">
          <label>
            ISBN
            <input value={book.isbn || ""} onChange={(e) => handleChange("isbn", e.target.value)} />
          </label>
          <label>
            Publisher
            <input value={book.publisher || ""} onChange={(e) => handleChange("publisher", e.target.value)} />
          </label>
        </div>

        <label>
          Rating (0–5)
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={book.rating}
            onChange={(e) => handleChange("rating", e.target.value)}
          />
        </label>

        <label>
          Cover Image
          <input type="file" accept=".jpg,.jpeg,.png,.gif,.webp" onChange={handleFile} />
        </label>
        {(preview || book.coverImagePath) && (
          <img
            className="cover-preview"
            src={preview || coverImageUrl(book.coverImagePath)}
            alt="Cover preview"
          />
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function FieldError({ errors, field }) {
  const msg = errors?.[field]?.[0];
  if (!msg) return null;
  return <span className="field-error">{msg}</span>;
}
