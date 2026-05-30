import apiClient from "./apiClient";

export const authService = {
  googleLogin: async (credentialToken: string) => {
    const response = await apiClient.post("/users/google-login", {
      token: credentialToken,
    });
    // Response is ApiResponse<AuthResponse> wrapper, extract the data
    return response.data.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post("/users/login", {
      email,
      password,
    });
    return response.data.data;
  },

  getUserProfile: async () => {
    const response = await apiClient.get("/users/profile");
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
  },
};
