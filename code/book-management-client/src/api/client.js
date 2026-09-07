import axios from "axios";

// Base URL of the BookManagement.Web API (see Properties/launchSettings.json
// on the backend, and .env here). Change .env if you run the API elsewhere.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5226";

const api = axios.create({ baseURL: API_URL });

// Cover images come back as relative paths like "/uploads/covers/xyz.jpg".
// The API serves them as static files, so we just prefix the API's origin.
export function coverImageUrl(path) {
  if (!path) return null;
  return `${API_URL}${path}`;
}

// Turns a book form object (+ optional File) into multipart/form-data,
// matching the [FromForm] CreateBookDto/UpdateBookDto on the backend.
function toFormData(book, coverImageFile) {
  const formData = new FormData();
  Object.entries(book).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  if (coverImageFile) {
    formData.append("coverImage", coverImageFile);
  }
  return formData;
}

export const booksApi = {
  list: (filter = {}) =>
    api.get("/api/books", { params: filter }).then((r) => r.data),

  getOptions: () => api.get("/api/books/options").then((r) => r.data),

  getById: (id) => api.get(`/api/books/${id}`).then((r) => r.data),

  create: (book, coverImageFile) =>
    api
      .post("/api/books", toFormData(book, coverImageFile), {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  update: (id, book, coverImageFile) =>
    api.put(`/api/books/${id}`, toFormData(book, coverImageFile), {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  remove: (id) => api.delete(`/api/books/${id}`),
};

export const dashboardApi = {
  get: () => api.get("/api/dashboard").then((r) => r.data),
};

export default api;
