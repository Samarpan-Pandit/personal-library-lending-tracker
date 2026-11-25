
import api from "./api";

// Get all books
export const getBooks = async () => {
  const response = await api.get("/api/books");
  return response.data;
};

// Get a specific book
export const getBookById = async (id) => {
  const response = await api.get(`/api/books/${id}`);
  return response.data;
};

// Add a new book
export const addBook = async (bookData) => {
  const response = await api.post("/api/books", bookData);
  return response.data;
};

// Update an existing book
export const updateBook = async (id, bookData) => {
  const response = await api.put(`/api/books/${id}`, bookData);
  return response.data;
};

// Delete a book
export const deleteBook = async (id) => {
  const response = await api.delete(`/api/books/${id}`);
  return response.data;
};

// Search books
export const searchBooks = async (searchParams) => {
  const response = await api.get("/api/books/search", {
    params: searchParams,
  });
  return response.data;
};
