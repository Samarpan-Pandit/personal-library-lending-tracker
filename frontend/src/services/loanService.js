
import api from "./api";

// Get all loans
export const getLoans = async () => {
  const response = await api.get("/api/loans");
  return response.data;
};

// Get active loans
export const getActiveLoans = async () => {
  const response = await api.get("/api/loans/active");
  return response.data;
};

// Get overdue loans
export const getOverdueLoans = async () => {
  const response = await api.get("/api/loans/overdue");
  return response.data;
};

// Lend a book
export const addLoan = async (loanData) => {
  const response = await api.post("/api/loans", loanData);
  return response.data;
};

// Return a book
export const returnBook = async (loanId) => {
  const response = await api.patch(`/api/loans/${loanId}/return`);
  return response.data;
};
