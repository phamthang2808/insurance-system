import { authService } from "@/services/authService";
import { useAuthStore } from "@/services/authStore";
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    google: any;
  }
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setAuthToken, setUserEmail, isAuthenticated } =
    useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
      return;
    }

    // Initialize Google Sign-In button
    const initializeGoogle = () => {
      if (window.google) {
        try {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleGoogleLogin,
          });
          const googleButtonElement = document.getElementById(
            "google-signin-button",
          );
          if (googleButtonElement) {
            window.google.accounts.id.renderButton(googleButtonElement, {
              theme: "outline",
              size: "large",
              text: "signin_with",
            });
          }
          setGoogleLoaded(true);
          setError(null);
        } catch (err) {
          console.error("Failed to initialize Google Sign-In:", err);
          setError(
            "Failed to initialize Google Sign-In. Please refresh the page.",
          );
        }
      } else {
        console.warn("Google API not loaded yet");
        // Retry in 500ms
        setTimeout(initializeGoogle, 500);
      }
    };

    initializeGoogle();
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = async (response: any) => {
    try {
      if (!response.credential) {
        console.error("No credential token received from Google");
        setError("No credential token received. Please try again.");
        return;
      }

      // Clear old auth data
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userEmail");

      console.log("Sending credential to backend...");
      // Send credential token to backend
      const result = await authService.googleLogin(response.credential);

      console.log("Backend response:", result); // Debug response structure

      if (result && result.accessToken) {
        const backendUser = result.user;
        const accessToken = result.accessToken;
        const refreshToken = result.refreshToken;

        console.log("User data:", backendUser); // Debug user fields
        console.log("Access Token:", accessToken); // Debug token

        // Validate user object
        if (!backendUser || !backendUser.email || !backendUser.id) {
          console.error(
            "Invalid user data received from backend:",
            backendUser,
          );
          setError("Invalid user data received. Please try again.");
          return;
        }

        // Map backend UserResponse to frontend User interface
        const user = {
          id: backendUser.id,
          email: backendUser.email,
          name: backendUser.fullName || backendUser.email.split("@")[0], // Map fullName to name
          photoUrl: backendUser.avatarUrl,
          createdAt: backendUser.createdAt,
          active: backendUser.isActive ?? true,
          role: backendUser.role, // Add role from backend
        };

        // Store tokens and user info
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        setUser(user);
        setAuthToken(accessToken);
        setUserEmail(user.email);

        console.log("Login successful:", user.email);
        navigate("/dashboard");
      } else {
        console.error("Login failed: Invalid response from backend");
        setError("Login failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle backend error response
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError("Login failed. Please check your connection.");
      }
    }
  };

  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Clear old auth data
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userEmail");

      const result = await authService.login(email, password);

      if (result && result.accessToken) {
        const backendUser = result.user;
        const accessToken = result.accessToken;
        const refreshToken = result.refreshToken;

        const user = {
          id: backendUser.id,
          email: backendUser.email,
          name: backendUser.fullName || backendUser.email.split("@")[0],
          photoUrl: backendUser.avatarUrl,
          createdAt: backendUser.createdAt,
          active: backendUser.isActive ?? true,
          role: backendUser.role,
        };

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        setUser(user);
        setAuthToken(accessToken);
        setUserEmail(user.email);

        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Local login error:", error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography variant="h2" gutterBottom>
          Hệ Thống Bảo Hiểm
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Hệ Thống Quản Lý Công Ty Bảo Hiểm
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2, width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper
          elevation={3}
          sx={{ p: 4, width: "100%", mt: 2, borderRadius: 2 }}
        >
          <form onSubmit={handleLocalLogin}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
            />
            <TextField
              fullWidth
              label="Mật Khẩu"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? "Đang Xử Lý..." : "Đăng Nhập"}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>HOẶC</Divider>

          <Box width="100%" display="flex" justifyContent="center">
            <div id="google-signin-button"></div>
          </Box>
        </Paper>

        {!googleLoaded && (
          <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
            Đang Tải Google Sign-In...
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default LoginPage;
