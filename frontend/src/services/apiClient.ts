import { API_BASE_URL } from "@/config";
import axios from "axios";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  // Don't add auth headers to login/auth endpoints
  if (config.url?.includes("/google-login") || config.url?.includes("/auth/")) {
    return config;
  }

  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const userEmail = localStorage.getItem("userEmail");
  if (userEmail) {
    config.headers["X-User-Email"] = userEmail;
  }
  return config;
});

export default apiClient;
