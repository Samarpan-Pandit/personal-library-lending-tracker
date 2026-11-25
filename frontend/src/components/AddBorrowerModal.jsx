
import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { addBorrower } from "../services/borrowerService";

import "./AddBookModal.css";

function AddBorrowerModal({ onClose, onBorrowerAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    contact: ""
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

    const borrowerData = {
      name: formData.name.trim(),
      contact: formData.contact.trim() || null
    };

    if (!borrowerData.name) {
      setError("Borrower name is required.");
      return;
    }

    try {
      setLoading(true);

      await addBorrower(borrowerData);

      onBorrowerAdded();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Unable to add borrower. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={loading ? undefined : onClose}>
      <div
        className="add-book-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-icon">
              <UserPlus size={22} />
            </div>

            <div>
              <h2>Add New Borrower</h2>
              <p>Enter the details of your library member.</p>
            </div>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={loading}
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
              <label htmlFor="borrower-name">
                Borrower Name <span>*</span>
              </label>

              <input
                id="borrower-name"
                name="name"
                type="text"
                placeholder="Enter borrower name"
                value={formData.name}
                onChange={handleChange}
                maxLength={150}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="borrower-contact">
                Contact / Email
              </label>

              <input
                id="borrower-contact"
                name="contact"
                type="text"
                placeholder="Enter email or contact details"
                value={formData.contact}
                onChange={handleChange}
                maxLength={254}
              />
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
              {loading ? "Saving..." : "Save Borrower"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBorrowerModal;
