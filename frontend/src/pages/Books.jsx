import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AddBookModal from "../components/AddBookModal";
import "./Books.css";
import {
  Search,
  Plus,
  BookOpen,
  RefreshCw,
  AlertCircle,
  Pencil,
  Trash2
} from "lucide-react";

import {
  getBooks,
  searchBooks,
  updateBook,
  deleteBook
} from "../services/bookService";

function Books() {
  const [searchParams] = useSearchParams();
  const [highlightedBookId, setHighlightedBookId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getBooks();

      setBooks(data.books || []);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Unable to load books. Please check the backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);
  
useEffect(() => {
  const bookId = searchParams.get("id");

  if (bookId) {
    setHighlightedBookId(Number(bookId));
  }
}, [searchParams]);

useEffect(() => {
  if (!highlightedBookId || books.length === 0) return;

  const selectedBook = document.getElementById(
    `book-${highlightedBookId}`
  );

  if (selectedBook) {
    selectedBook.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}, [highlightedBookId, books]);

  const handleSearch = async (value) => {
    setSearchTerm(value);

    try {
      setError("");

      if (!value.trim()) {
        await loadBooks();
        return;
      }

      const data = await searchBooks({ q: value });

      setBooks(data.books || []);
    } catch (err) {
      setError(
        err.response?.data?.error || "Unable to search books."
      );
    }
  };
  const handleEdit = async (book) => {
  const newTitle = window.prompt("Enter book title:", book.title);

  if (newTitle === null) return;

  if (!newTitle.trim()) {
    window.alert("Book title cannot be empty.");
    return;
  }

  const updatedBook = {
    title: newTitle.trim(),
    author: book.author,
    genre: book.genre,
    isbn: book.isbn,
    publication_year: book.publication_year,
    description: book.description,
    summary_tags: Array.isArray(book.summary_tags)
      ? book.summary_tags
      : []
  };

  try {
    await updateBook(book.book_id, updatedBook);
    window.alert("Book updated successfully!");
    await loadBooks();
  } catch (err) {
    window.alert(
      err.response?.data?.error || "Unable to update book."
    );
  }
};

const handleDelete = async (book) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${book.title}"?`
  );

  if (!confirmed) return;

  try {
    await deleteBook(book.book_id);
    window.alert("Book deleted successfully!");
    await loadBooks();
  } catch (err) {
    window.alert(
      err.response?.data?.error || "Unable to delete book."
    );
  }
};

  return (
    <div className="books-page">
      <div className="books-page-heading">
        <div>
          <p className="eyebrow">LIBRARY COLLECTION</p>
          <h1>Books Management</h1>
          <p className="books-subtitle">
            Manage and organize your personal book collection.
          </p>
        </div>

        <button
  className="primary-button"
  type="button"
  onClick={() => setShowAddModal(true)}
>
  <Plus size={19} />
  Add New Book
</button>
      </div>

      <div className="books-toolbar">
        <div className="books-search">
          <Search size={19} />
          <input
            type="text"
            placeholder="Search by title, author, genre or ISBN..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <button
          className="refresh-button"
          onClick={loadBooks}
          type="button"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="books-table-container">
        <div className="books-table-heading">
          <div>
            <h2>All Books</h2>
            <p>{books.length} books found</p>
          </div>
        </div>

        {loading ? (
          <div className="books-message">
            <RefreshCw size={24} className="loading-icon" />
            <p>Loading books...</p>
          </div>
        ) : error ? (
          <div className="books-message error-message">
            <AlertCircle size={25} />
            <p>{error}</p>
            <button onClick={loadBooks} type="button">
              Try Again
            </button>
          </div>
        ) : books.length === 0 ? (
          <div className="books-message">
            <BookOpen size={35} />
            <h3>No books found</h3>
            <p>
              {searchTerm
                ? "Try another search term."
                : "Add your first book to get started."}
            </p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="books-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>ISBN</th>
                  <th>Year</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {books.map((book) => (
                  <tr
  key={book.book_id}
  id={`book-${book.book_id}`}
  className={
    highlightedBookId === Number(book.book_id)
      ? "highlighted-book-row"
      : ""
  }
>
                    <td>
                      <div className="book-title-cell">
                        <div className="book-mini-icon">
                          <BookOpen size={18} />
                        </div>
                        <strong>{book.title}</strong>
                      </div>
                    </td>

                    <td>{book.author || "—"}</td>
                    <td>{book.genre || "—"}</td>
                    <td>{book.isbn || "—"}</td>
                    <td>{book.publication_year || "—"}</td>

                    <td>
                      <span
                        className={`availability-badge ${
                          book.available ? "available" : "lent"
                        }`}
                      >
                        {book.available ? "Available" : "Lent"}
                      </span>
                    </td>
                    <td>
  <div className="book-actions">
    <button
      type="button"
      className="edit-book-button"
      onClick={() => handleEdit(book)}
      title="Edit book"
    >
      <Pencil size={16} />
    </button>

    <button
      type="button"
      className="delete-book-button"
      onClick={() => handleDelete(book)}
      title="Delete book"
    >
      <Trash2 size={16} />
    </button>
  </div>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
           </div>

      {showAddModal && (
        <AddBookModal
          onClose={() => setShowAddModal(false)}
          onBookAdded={loadBooks}
        />
      )}
    </div>
  );
}

export default Books;