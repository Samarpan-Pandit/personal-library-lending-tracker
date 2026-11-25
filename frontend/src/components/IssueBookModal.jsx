
import { useEffect, useState } from "react";
import { X, BookOpen, UserRound, CalendarDays } from "lucide-react";

import { getBooks } from "../services/bookService";
import { getBorrowers } from "../services/borrowerService";
import { getActiveLoans, addLoan } from "../services/loanService";

import "./IssueBookModal.css";

function IssueBookModal({ onClose, onLoanAdded }) {
  const [books, setBooks] = useState([]);
  const [borrowers, setBorrowers] = useState([]);

  const [bookId, setBookId] = useState("");
  const [borrowerId, setBorrowerId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const getArray = (data, keys) => {
    if (Array.isArray(data)) return data;

    for (const key of keys) {
      if (Array.isArray(data?.[key])) {
        return data[key];
      }
    }

    return [];
  };

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      setError("");

      const [booksResponse, borrowersResponse, loansResponse] =
        await Promise.all([
          getBooks(),
          getBorrowers(),
          getActiveLoans()
        ]);

      const allBooks = getArray(booksResponse, ["books"]);
      const allBorrowers = getArray(borrowersResponse, ["borrowers"]);

      // Backend returns active loans under active_loans
      const activeLoans = getArray(loansResponse, [
        "active_loans",
        "loans"
      ]);

      const borrowedBookIds = activeLoans.map((loan) =>
        Number(loan.book_id)
      );

      const availableBooks = allBooks.filter((book) => {
        const id = Number(book.book_id ?? book.id);
        return !borrowedBookIds.includes(id);
      });

      setBooks(availableBooks);
      setBorrowers(allBorrowers);

    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Unable to load books and borrowers. Please check the backend."
      );
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadFormData();
  }, []);

  const getToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!bookId || !borrowerId || !dueDate) {
      setError("Please fill in all the fields.");
      return;
    }

    if (dueDate < getToday()) {
      setError("Due date cannot be earlier than today.");
      return;
    }

    try {
      setSubmitting(true);

      await addLoan({
        book_id: Number(bookId),
        borrower_id: Number(borrowerId),
        due_date: dueDate
      });

      await onLoanAdded();
      onClose();

    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Unable to issue this book. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="issue-modal-overlay" onClick={onClose}>
      <div
        className="issue-modal"
        onClick={(event) => event.stopPropagation()}
      >

        {/* Modal Header */}
        <div className="issue-modal-header">
          <div>
            <p className="eyebrow">LIBRARY TRANSACTIONS</p>
            <h2>Issue New Book</h2>
            <p>Select a book, borrower and due date.</p>
          </div>

          <button
            className="issue-close-button"
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={21} />
          </button>
        </div>

        {loadingData ? (
          <div className="issue-loading">
            Loading books and borrowers...
          </div>
        ) : (
          <form className="issue-form" onSubmit={handleSubmit}>

            {error && (
              <div className="issue-error">
                {error}
              </div>
            )}

            {/* Select Book */}
            <div className="issue-form-group">
              <label htmlFor="issue-book">
                <BookOpen size={16} />
                Select Book
              </label>

              <select
                id="issue-book"
                value={bookId}
                onChange={(event) => setBookId(event.target.value)}
                required
              >
                <option value="">Choose an available book</option>

                {books.map((book) => (
                  <option
                    key={book.book_id ?? book.id}
                    value={book.book_id ?? book.id}
                  >
                    {book.title} — {book.author}
                  </option>
                ))}
              </select>

              {books.length === 0 && (
                <small>No available books found.</small>
              )}
            </div>

            {/* Select Borrower */}
            <div className="issue-form-group">
              <label htmlFor="issue-borrower">
                <UserRound size={16} />
                Select Borrower
              </label>

              <select
                id="issue-borrower"
                value={borrowerId}
                onChange={(event) => setBorrowerId(event.target.value)}
                required
              >
                <option value="">Choose a borrower</option>

                {borrowers.map((borrower) => (
                  <option
                    key={borrower.borrower_id ?? borrower.id}
                    value={borrower.borrower_id ?? borrower.id}
                  >
                    {borrower.name}
                  </option>
                ))}
              </select>

              {borrowers.length === 0 && (
                <small>No borrowers found. Add a borrower first.</small>
              )}
            </div>

            {/* Due Date */}
            <div className="issue-form-group">
              <label htmlFor="issue-due-date">
                <CalendarDays size={16} />
                Due Date
              </label>

              <input
                id="issue-due-date"
                type="date"
                min={getToday()}
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                required
              />
            </div>

            {/* Buttons */}
            <div className="issue-modal-actions">
              <button
                className="issue-cancel-button"
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                className="issue-submit-button"
                type="submit"
                disabled={
                  submitting ||
                  books.length === 0 ||
                  borrowers.length === 0
                }
              >
                {submitting ? "Issuing..." : "Issue Book"}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}

export default IssueBookModal;
