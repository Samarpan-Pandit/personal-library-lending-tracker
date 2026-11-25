
import { useState } from "react";
import { X, BookPlus } from "lucide-react";
import { addBook } from "../services/bookService";

import "./AddBookModal.css";

function AddBookModal({ onClose, onBookAdded }) {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    isbn: "",
    publication_year: "",
    description: "",
    summary_tags: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const bookData = {
      title: formData.title.trim(),
      author: formData.author.trim() || null,
      genre: formData.genre.trim() || null,
      isbn: formData.isbn.trim() || null,
      publication_year: formData.publication_year
        ? Number(formData.publication_year)
        : null,
      description: formData.description.trim() || null,
      summary_tags: formData.summary_tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    };

    if (
      bookData.publication_year !== null &&
      (!Number.isInteger(bookData.publication_year) ||
        bookData.publication_year < 1 ||
        bookData.publication_year > 9999)
    ) {
      setError("Please enter a valid publication year.");
      return;
    }

    try {
      setLoading(true);

      await addBook(bookData);

      onBookAdded();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Unable to add book. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="add-book-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-icon">
              <BookPlus size={22} />
            </div>

            <div>
              <h2>Add New Book</h2>
              <p>Enter the details of your book collection.</p>
            </div>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close form"
          >
            <X size={21} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="title">
                Book Title <span>*</span>
              </label>

              <input
                id="title"
                name="title"
                type="text"
                placeholder="Enter book title"
                value={formData.title}
                onChange={handleChange}
                maxLength={250}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="author">Author</label>

                <input
                  id="author"
                  name="author"
                  type="text"
                  placeholder="Enter author name"
                  value={formData.author}
                  onChange={handleChange}
                  maxLength={200}
                />
              </div>

              <div className="form-group">
                <label htmlFor="genre">Genre</label>

                <input
                  id="genre"
                  name="genre"
                  type="text"
                  placeholder="e.g. Fiction"
                  value={formData.genre}
                  onChange={handleChange}
                  maxLength={100}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="isbn">ISBN</label>

                <input
                  id="isbn"
                  name="isbn"
                  type="text"
                  placeholder="Enter ISBN"
                  value={formData.isbn}
                  onChange={handleChange}
                  maxLength={20}
                />
              </div>

              <div className="form-group">
                <label htmlFor="publication_year">
                  Publication Year
                </label>

                <input
                  id="publication_year"
                  name="publication_year"
                  type="number"
                  placeholder="e.g. 2020"
                  value={formData.publication_year}
                  onChange={handleChange}
                  min="1"
                  max="9999"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>

              <textarea
                id="description"
                name="description"
                placeholder="Enter a short book description"
                value={formData.description}
                onChange={handleChange}
                maxLength={20000}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="summary_tags">Summary Tags</label>

              <input
                id="summary_tags"
                name="summary_tags"
                type="text"
                placeholder="e.g. adventure, fiction, mystery"
                value={formData.summary_tags}
                onChange={handleChange}
              />

              <small>Separate multiple tags with commas.</small>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-book-button"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Book"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBookModal;
