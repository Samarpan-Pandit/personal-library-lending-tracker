
import api from "./api";

// Get all borrowers
export const getBorrowers = async () => {
  const response = await api.get("/api/borrowers");
  return response.data;
};

// Get a specific borrower
export const getBorrowerById = async (id) => {
  const response = await api.get(`/api/borrowers/${id}`);
  return response.data;
};

// Add a new borrower
export const addBorrower = async (borrowerData) => {
  const response = await api.post("/api/borrowers", borrowerData);
  return response.data;
};
