import AddBorrowerModal from "../components/AddBorrowerModal";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  Mail,
  UserRound
} from "lucide-react";

import { getBorrowers } from "../services/borrowerService";

import "./Borrowers.css";

function Borrowers() {
  const [searchParams] = useSearchParams();
  const [highlightedBorrowerId, setHighlightedBorrowerId] = useState(null);
  const [borrowers, setBorrowers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBorrowers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getBorrowers();

      setBorrowers(data.borrowers || []);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Unable to load borrowers. Please check the backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBorrowers();
  }, []);

useEffect(() => {
  const borrowerId = searchParams.get("id");

  if (borrowerId) {
    setHighlightedBorrowerId(Number(borrowerId));
  }
}, [searchParams]);

useEffect(() => {
  if (!highlightedBorrowerId || borrowers.length === 0) return;

  const selectedBorrower = document.getElementById(
    `borrower-${highlightedBorrowerId}`
  );

  if (selectedBorrower) {
    selectedBorrower.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}, [highlightedBorrowerId, borrowers]);

  const filteredBorrowers = borrowers.filter((borrower) =>
    [borrower.name, borrower.contact]
      .filter(Boolean)
      .some((value) =>
        value.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <div className="borrowers-page">
      <div className="borrowers-page-heading">
        <div>
          <p className="eyebrow">LIBRARY MEMBERS</p>
          <h1>Borrowers Management</h1>
          <p className="borrowers-subtitle">
            Manage and organize your library borrowers.
          </p>
        </div>
<button
  className="primary-button"
  type="button"
  onClick={() => setShowAddModal(true)}
>
  <Plus size={19} />
  Add New Borrower
</button>
      </div>

      <div className="borrowers-toolbar">
        <div className="borrowers-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search by borrower name or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          className="refresh-button"
          onClick={loadBorrowers}
          type="button"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="borrowers-table-container">
        <div className="borrowers-table-heading">
          <div>
            <h2>All Borrowers</h2>
            <p>{filteredBorrowers.length} borrowers found</p>
          </div>
        </div>

        {loading ? (
          <div className="borrowers-message">
            <RefreshCw size={24} className="loading-icon" />
            <p>Loading borrowers...</p>
          </div>
        ) : error ? (
          <div className="borrowers-message error-message">
            <AlertCircle size={25} />
            <p>{error}</p>

            <button onClick={loadBorrowers} type="button">
              Try Again
            </button>
          </div>
        ) : filteredBorrowers.length === 0 ? (
          <div className="borrowers-message">
            <Users size={35} />
            <h3>No borrowers found</h3>
            <p>
              {searchTerm
                ? "Try another search term."
                : "Add your first borrower to get started."}
            </p>
          </div>
        ) : (
          <div className="borrowers-table-scroll">
            <table className="borrowers-table">
              <thead>
                <tr>
                  <th>Borrower</th>
                  <th>Contact</th>
                  <th>Borrower ID</th>
                  <th>Registered Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredBorrowers.map((borrower) => (
                  <tr
  key={borrower.borrower_id}
  id={`borrower-${borrower.borrower_id}`}
  className={
    highlightedBorrowerId === Number(borrower.borrower_id)
      ? "highlighted-borrower-row"
      : ""
  }
>
                    <td>
                      <div className="borrower-name-cell">
                        <div className="borrower-avatar">
                          <UserRound size={19} />
                        </div>

                        <strong>{borrower.name}</strong>
                      </div>
                    </td>

                    <td>
                      <div className="borrower-contact">
                        <Mail size={15} />
                        {borrower.contact || "—"}
                      </div>
                    </td>

                    <td>#{borrower.borrower_id}</td>

                    <td>
                      {borrower.created_at
                        ? new Date(borrower.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
           </div>

      {showAddModal && (
        <AddBorrowerModal
          onClose={() => setShowAddModal(false)}
          onBorrowerAdded={loadBorrowers}
        />
      )}
    </div>
  );
}

export default Borrowers;