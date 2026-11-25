
import api from "./api";

// Get dashboard statistics
export const getDashboardStats = async () => {
  const response = await api.get("/api/dashboard");
  return response.data;
};
