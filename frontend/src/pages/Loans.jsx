
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Repeat,
  Plus,
  RefreshCw,
  AlertCircle,
  BookOpen,
  UserRound,
  CheckCircle,
  Clock,
  AlertTriangle,
  Library
} from "lucide-react";

import IssueBookModal from "../components/IssueBookModal";
import { getLoans, returnBook } from "../services/loanService";
import "./Loans.css";

// Format database timestamps into readable dates
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

function Loans() {
  const [searchParams] = useSearchParams();
  const [highlightedLoanId, setHighlightedLoanId] = useState(null);
  const [loans, setLoans] = useState([]);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [returningId, setReturningId] = useState(null);

  // Calculate loan summary counts dynamically
  const totalLoans = loans.length;

  
const activeLoans = loans.filter(
  (loan) => loan.loan_status?.toLowerCase() === "active"
).length;

const returnedLoans = loans.filter(
  (loan) => loan.loan_status?.toLowerCase() === "returned"
).length;

const overdueLoans = loans.filter(
  (loan) => loan.loan_status?.toLowerCase() === "overdue"
).length;


  const loadLoans = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getLoans();
      setLoans(data.loans || []);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Unable to load loans. Please check the backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

useEffect(() => {
  const loanId = searchParams.get("id");

  if (loanId) {
    setHighlightedLoanId(Number(loanId));
  }
}, [searchParams]);

useEffect(() => {
  if (!highlightedLoanId || loans.length === 0) return;

  const selectedLoan = document.getElementById(
    `loan-${highlightedLoanId}`
  );

  if (selectedLoan) {
    selectedLoan.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}, [highlightedLoanId, loans]);

  const handleReturn = async (loanId) => {
    const confirmed = window.confirm(
      "Are you sure you want to return this book?"
    );

    if (!confirmed) return;

    try {
      setReturningId(loanId);
      setError("");

      await returnBook(loanId);
      await loadLoans();
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
    <div className="loans-page">

      {/* Page Heading */}
      <div className="loans-page-heading">
        <div>
          <p className="eyebrow">LIBRARY TRANSACTIONS</p>
          <h1>Loans Management</h1>
          <p className="loans-subtitle">
            Manage book lending and return activities.
          </p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={() => setShowIssueModal(true)}
        >
          <Plus size={19} />
          Issue New Book
        </button>
      </div>

      {/* Loan Summary Cards */}
      <div className="loans-summary-grid">

        <div className="loan-summary-card">
          <div className="loan-summary-icon total">
            <Library size={23} />
          </div>
          <div className="loan-summary-info">
            <p>Total Loans</p>
            <h2>{totalLoans}</h2>
          </div>
        </div>

        <div className="loan-summary-card">
          <div className="loan-summary-icon active">
            <BookOpen size={23} />
          </div>
          <div className="loan-summary-info">
            <p>Active Loans</p>
            <h2>{activeLoans}</h2>
          </div>
        </div>

        <div className="loan-summary-card">
          <div className="loan-summary-icon returned">
            <CheckCircle size={23} />
          </div>
          <div className="loan-summary-info">
            <p>Returned Loans</p>
            <h2>{returnedLoans}</h2>
          </div>
        </div>

        <div className="loan-summary-card">
          <div className="loan-summary-icon overdue">
            <AlertTriangle size={23} />
          </div>
          <div className="loan-summary-info">
            <p>Overdue Loans</p>
            <h2>{overdueLoans}</h2>
          </div>
        </div>

      </div>

      {/* Refresh Button */}
      <div className="loans-toolbar">
        <button
          className="refresh-button"
          type="button"
          onClick={loadLoans}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Loans Table */}
      <div className="loans-table-container">
        <div className="loans-table-heading">
          <div>
            <h2>All Lending Records</h2>
            <p>{loans.length} lending records found</p>
          </div>
        </div>

        {loading ? (
          <div className="loans-message">
            <RefreshCw size={24} className="loading-icon" />
            <p>Loading loans...</p>
          </div>
        ) : error ? (
          <div className="loans-message error-message">
            <AlertCircle size={25} />
            <p>{error}</p>
            <button onClick={loadLoans} type="button">
              Try Again
            </button>
          </div>
        ) : loans.length === 0 ? (
          <div className="loans-message">
            <Repeat size={35} />
            <h3>No lending records found</h3>
            <p>Issue your first book to see lending records here.</p>
          </div>
        ) : (
          <div className="loans-table-scroll">
            <table className="loans-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Borrower</th>
                  <th>Loan Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loans.map((loan) => (
                  <tr
  key={loan.loan_id}
  id={`loan-${loan.loan_id}`}
  className={
    highlightedLoanId === Number(loan.loan_id)
      ? "highlighted-loan-row"
      : ""
  }
>

                    {/* Book */}
                    <td>
                      <div className="loan-book-cell">
                        <BookOpen size={18} />
                        <strong>
                          {loan.title ||
                            loan.book_title ||
                            loan.book_name ||
                            `Book #${loan.book_id}`}
                        </strong>
                      </div>
                    </td>

                    {/* Borrower */}
                    <td>
                      <div className="loan-borrower-cell">
                        <UserRound size={17} />
                        {loan.borrower_name || "Unknown Borrower"}
                      </div>
                    </td>

                    {/* Dates */}
                    <td>{formatDate(loan.loan_date)}</td>
                    <td>{formatDate(loan.due_date)}</td>
                    <td>{formatDate(loan.return_date)}</td>

                    {/* Status */}
                    <td>
                      
<span
  className={`loan-status ${
    loan.loan_status?.toLowerCase()
  }`}
>
  {loan.loan_status || "Unknown"}
</span>

                    </td>

                    {/* Action */}
                    <td>
                      {loan.return_date ? (
                        <span className="returned-label">
                          <CheckCircle size={15} />
                          Returned
                        </span>
                      ) : (
                        <button
                          className="return-button"
                          type="button"
                          disabled={returningId === loan.loan_id}
                          onClick={() => handleReturn(loan.loan_id)}
                        >
                          {returningId === loan.loan_id
                            ? "Returning..."
                            : "Return Book"}
                        </button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Issue Book Modal */}
      {showIssueModal && (
        <IssueBookModal
          onClose={() => setShowIssueModal(false)}
          onLoanAdded={loadLoans}
        />
      )}

    </div>
  );
}

export default Loans;
