import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import BooksList from "./pages/BooksList";
import BookForm from "./pages/BookForm";
import BookDetails from "./pages/BookDetails";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<BooksList />} />
          <Route path="/books/new" element={<BookForm />} />
          <Route path="/books/:id" element={<BookDetails />} />
          <Route path="/books/:id/edit" element={<BookForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
