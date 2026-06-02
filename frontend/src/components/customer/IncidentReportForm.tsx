import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper, Alert, MenuItem } from "@mui/material";
import apiClient from "@/services/apiClient";

export const IncidentReportForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("NORMAL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Get user from localStorage (stored as "user" in LoginPage)
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      
      await apiClient.post("/incidents", {
        customerId: user?.id,
        title,
        description,
        severity
      });

      setTitle("");
      setDescription("");
      setSeverity("NORMAL");
      
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Gửi báo cáo thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight="bold" mb={2}>Báo cáo sự cố</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Tiêu đề"
          fullWidth
          required
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ví dụ: Tai nạn giao thông"
        />
        <TextField
          select
          label="Mức độ nghiêm trọng"
          fullWidth
          required
          margin="normal"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <MenuItem value="LOW">Thấp</MenuItem>
          <MenuItem value="NORMAL">Bình thường</MenuItem>
          <MenuItem value="HIGH">Cao</MenuItem>
          <MenuItem value="URGENT">Khẩn cấp</MenuItem>
        </TextField>
        <TextField
          label="Mô tả chi tiết"
          fullWidth
          required
          multiline
          rows={4}
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Vui lòng mô tả chi tiết sự cố..."
        />
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            sx={{ backgroundColor: "#4f46e5", "&:hover": { backgroundColor: "#4338ca" } }}
          >
            {loading ? "Đang gửi..." : "Gửi Báo Cáo"}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};
