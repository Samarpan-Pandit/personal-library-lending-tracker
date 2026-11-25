
import { useEffect, useState } from "react";
import {
  Clock,
  RefreshCw,
  AlertCircle,
  BookOpen,
  UserRound,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

import {
  getOverdueLoans,
  returnBook
} from "../services/loanService";

import "./Overdue.css";

// Format dates
const formatDate = (dateValue) => {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata"
  });
};

function Overdue() {
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [returningId, setReturningId] = useState(null);

  // Load overdue records
  const loadOverdueLoans = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getOverdueLoans();
      setOverdueLoans(data.overdue_loans || []);

    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Unable to load overdue books. Please check the backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverdueLoans();
  }, []);

  // Return an overdue book
  const handleReturn = async (loanId) => {
    const confirmed = window.confirm(
      "Are you sure you want to return this overdue book?"
    );

    if (!confirmed) return;

    try {
      setReturningId(loanId);
      setError("");

      await returnBook(loanId);
      await loadOverdueLoans();

    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Unable to return this book."
      );
    } finally {
      setReturningId(null);
    }
  };

  return (
    <div className="overdue-page">

      {/* Page Heading */}
      <div className="overdue-page-heading">
        <div>
          <p className="eyebrow">LIBRARY TRANSACTIONS</p>
          <h1>Overdue Books</h1>
          <p className="overdue-subtitle">
            Monitor books that have passed their due dates.
          </p>
        </div>

        <button
          className="refresh-button"
          type="button"
          onClick={loadOverdueLoans}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Overdue Summary */}
      <div className="overdue-summary-card">
        <div className="overdue-summary-icon">
          <AlertTriangle size={25} />
        </div>

        <div>
          <p>Total Overdue Books</p>
          <h2>{overdueLoans.length}</h2>
          <span>Books awaiting return after their due dates</span>
        </div>
      </div>

      {/* Overdue Records */}
      <div className="overdue-table-container">

        <div className="overdue-table-heading">
          <div>
            <h2>Overdue Lending Records</h2>
            <p>
              {overdueLoans.length} overdue records found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="overdue-message">
            <RefreshCw size={24} className="loading-icon" />
            <p>Loading overdue books...</p>
          </div>
        ) : error ? (
          <div className="overdue-message error-message">
            <AlertCircle size={25} />
            <p>{error}</p>

            <button
              type="button"
              onClick={loadOverdueLoans}
            >
              Try Again
            </button>
          </div>
        ) : overdueLoans.length === 0 ? (
          <div className="overdue-message">
            <CheckCircle size={38} />
            <h3>No overdue books</h3>
            <p>
              Great! All currently borrowed books are within their due dates.
            </p>
          </div>
        ) : (
          <div className="overdue-table-scroll">
            <table className="overdue-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Borrower</th>
                  <th>Loan Date</th>
                  <th>Due Date</th>
                  <th>Days Overdue</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {overdueLoans.map((loan) => (
                  <tr key={loan.loan_id}>

                    {/* Book */}
                    <td>
                      <div className="overdue-book-cell">
                        <BookOpen size={18} />
                        <strong>
                          {loan.book_title || loan.title ||
                            `Book #${loan.book_id}`}
                        </strong>
                      </div>
                    </td>

                    {/* Borrower */}
                    <td>
                      <div className="overdue-borrower-cell">
                        <UserRound size={17} />
                        {loan.borrower_name || "Unknown Borrower"}
                      </div>
                    </td>

                    {/* Dates */}
                    <td>{formatDate(loan.loan_date)}</td>
                    <td>{formatDate(loan.due_date)}</td>

                    {/* Days Overdue */}
                    <td>
                      <span className="days-overdue">
                        {loan.days_overdue} days
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <span className="overdue-status">
                        <Clock size={14} />
                        Overdue
                      </span>
                    </td>

                    {/* Return Action */}
                    <td>
                      <button
                        className="overdue-return-button"
                        type="button"
                        disabled={returningId === loan.loan_id}
                        onClick={() => handleReturn(loan.loan_id)}
                      >
                        {returningId === loan.loan_id
                          ? "Returning..."
                          : "Return Book"}
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

export default Overdue;
