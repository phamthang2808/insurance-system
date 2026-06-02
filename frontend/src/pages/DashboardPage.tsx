import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { CustomerActions } from "@/components/customer/CustomerActions";
import { IncidentReportForm } from "@/components/customer/IncidentReportForm";
import { StaffActions } from "@/components/staff/StaffActions";
import apiClient from "@/services/apiClient";
import { useAuthStore } from "@/services/authStore";
import type { DashboardStats } from "@/types";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Toolbar,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const parseJacksonDate = (val: any): Date | null => {
  if (!val) return null;
  if (Array.isArray(val)) {
    // JS months are 0-indexed, Jackson array sends 1-indexed (e.g. 6 = June)
    return new Date(
      val[0],
      val[1] - 1,
      val[2],
      val[3] || 0,
      val[4] || 0,
      val[5] || 0
    );
  }
  return new Date(val);
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    refreshProfileAndLoadData();
  }, []);

  const refreshProfileAndLoadData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Always fetch fresh profile from server to get latest role
      const profileRes = await apiClient.get("/users/profile");
      if (profileRes.data?.data) {
        const backendUser = profileRes.data.data;
        const freshUser = {
          id: backendUser.id,
          email: backendUser.email,
          name: backendUser.fullName || backendUser.email.split("@")[0],
          photoUrl: backendUser.avatarUrl,
          createdAt: backendUser.createdAt,
          active: backendUser.isActive ?? true,
          role: backendUser.role,
        };
        // Update store and localStorage with fresh data
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
      }

      // Then load dashboard stats
      const res = await apiClient.get("/dashboard/stats");
      if (res.data?.data) {
        setStats(res.data.data);
      }
    } catch (err: any) {
      console.error("Failed to load dashboard:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Lỗi khi tải dữ liệu. API /dashboard/stats có thể đang bị sập 500.",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadData = refreshProfileAndLoadData;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f4f6" }}>
      <AppBar position="static" sx={{ bgcolor: "#1f2937" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            🛡️ Hệ Thống Bảo Hiểm
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Chào mừng, {user?.email} ({user?.role})
          </Typography>
          {isAdmin && (
            <Button
              color="inherit"
              onClick={() => navigate("/admin")}
              sx={{ mr: 2 }}
            >
              Bảng Điều Khiển Admin
            </Button>
          )}
          <Button color="inherit" onClick={handleLogout}>
            Đăng Xuất
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {error && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: "#fee2e2",
              color: "#b91c1c",
              borderRadius: 1,
              border: "1px solid #f87171",
            }}
          >
            <Typography variant="body1" fontWeight="bold">
              🚨 Cảnh báo:
            </Typography>
            <Typography variant="body2">{error}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Gợi ý: API /dashboard/stats đang bị lỗi 500 do chưa nhận code mới.
              Bạn cần bấm Stop ứng dụng backend đang chạy trong IntelliJ và bấm
              Run lại!
            </Typography>
          </Box>
        )}

        <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
          Tổng Quan
        </Typography>

        {isAdmin ? (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#3b82f6", color: "white" }}>
                  <CardContent>
                    <Typography variant="h6">Tổng Số Người Dùng</Typography>
                    <Typography variant="h3">
                      {stats?.totalUsers || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#10b981", color: "white" }}>
                  <CardContent>
                    <Typography variant="h6">Hợp Đồng Hoạt Động</Typography>
                    <Typography variant="h3">
                      {stats?.activePolicies || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#f59e0b", color: "white" }}>
                  <CardContent>
                    <Typography variant="h6">Tổng Gói Bảo Hiểm</Typography>
                    <Typography variant="h3">
                      {stats?.totalPackages || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#ef4444", color: "white" }}>
                  <CardContent>
                    <Typography variant="h6">Sự Cố Chờ Xử Lý</Typography>
                    <Typography variant="h3">
                      {stats?.pendingIncidents || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ bgcolor: "#8b5cf6", color: "white" }}>
                  <CardContent>
                    <Typography variant="h6">Tổng Doanh Thu</Typography>
                    <Typography variant="h3">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats?.totalRevenue || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Tổng Quan Hệ Thống
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            {
                              name: "Người Dùng",
                              value: stats?.totalUsers || 0,
                            },
                            {
                              name: "Hợp Đồng",
                              value: stats?.activePolicies || 0,
                            },
                            { name: "Gói", value: stats?.totalPackages || 0 },
                            {
                              name: "Sự Cố",
                              value: stats?.totalIncidents || 0,
                            },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="value" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Trạng Thái Sự Cố
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: "Chờ Xử Lý",
                                value: stats?.pendingIncidents || 0,
                              },
                              {
                                name: "Đã Giải Quyết",
                                value:
                                  (stats?.totalIncidents || 0) -
                                  (stats?.pendingIncidents || 0),
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell fill="#ef4444" />
                            <Cell fill="#10b981" />
                          </Pie>
                          <RechartsTooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Phân Bố Gói Bảo Hiểm
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={Object.entries(stats?.packageStats || {}).map(
                              ([name, value]) => ({ name, value }),
                            )}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                          >
                            {Object.entries(stats?.packageStats || {}).map(
                              (_, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    [
                                      "#0088FE",
                                      "#00C49F",
                                      "#FFBB28",
                                      "#FF8042",
                                    ][index % 4]
                                  }
                                />
                              ),
                            )}
                          </Pie>
                          <RechartsTooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        ) : user?.role === "STAFF" ? (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#8b5cf6", color: "white" }}>
                  <CardContent>
                    <Typography variant="h6">Khách Hàng Giao Đồ</Typography>
                    <Typography variant="h3">
                      {stats?.assignedCustomers || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#06b6d4", color: "white" }}>
                  <CardContent>
                    <Typography variant="h6">Tổng Hợp Đồng</Typography>
                    <Typography variant="h3">
                      {stats?.totalPolicies || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#f43f5e", color: "white" }}>
                  <CardContent>
                    <Typography variant="h6">Tổng Sự Cố</Typography>
                    <Typography variant="h3">
                      {stats?.totalIncidents || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#eab308", color: "white" }}>
                  <CardContent>
                    <Typography variant="h6">Sự Cố Chờ Xử Lý</Typography>
                    <Typography variant="h3">
                      {stats?.pendingIncidents || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ bgcolor: "#22c55e", color: "white" }}>
                  <CardContent>
                    <Typography variant="h6">Doanh Thủ Cá Nhân</Typography>
                    <Typography variant="h3">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats?.personalSales || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Tổng Quan Khối Lượng Cá Nhân
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            {
                              name: "Khách Hàng",
                              value: stats?.assignedCustomers || 0,
                            },
                            {
                              name: "Hợp Đồng",
                              value: stats?.totalPolicies || 0,
                            },
                            {
                              name: "Sự Cố",
                              value: stats?.totalIncidents || 0,
                            },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="value" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <StaffActions onActionComplete={loadData} />
          </>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Hợp Đồng Của Tôi
                  </Typography>
                  <CustomerActions onActionComplete={loadData} />
                  {stats?.myPolicies && stats.myPolicies.length > 0 ? (
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      {stats.myPolicies.map((p, idx) => {
                        const remaining = (p.totalAmount || 0) - (p.amountPaid || 0);
                        const paidPercent = p.totalAmount ? Math.min(100, Math.max(0, Math.round(((p.amountPaid || 0) / p.totalAmount) * 100))) : 0;
                        
                        const startD = parseJacksonDate(p.startDate);
                        const endD = parseJacksonDate(p.endDate);
                        const startStr = startD && !isNaN(startD.getTime()) ? startD.toLocaleDateString("vi-VN") : "N/A";
                        const endStr = endD && !isNaN(endD.getTime()) ? endD.toLocaleDateString("vi-VN") : "N/A";
                        
                        const stepMap: Record<string, { label: string; color: string; bg: string }> = {
                          'RECEIVING': { label: 'Tiếp nhận', color: '#2563eb', bg: '#eff6ff' },
                          'APPRAISING': { label: 'Thẩm định', color: '#d97706', bg: '#fffbeb' },
                          'SIGNING': { label: 'Ký hợp đồng', color: '#7c3aed', bg: '#f5f3ff' },
                          'ACTIVE': { label: 'Hoàn thành', color: '#16a34a', bg: '#ecfdf5' },
                          'COMPLETED': { label: 'Hoàn thành', color: '#16a34a', bg: '#ecfdf5' },
                        };
                        const stepInfo = stepMap[p.processStep || "RECEIVING"] || { label: p.processStep || 'Chưa rõ', color: '#4b5563', bg: '#f3f4f6' };

                        const statusMap: Record<string, { label: string; color: string; bg: string }> = {
                          'PENDING': { label: 'Chờ duyệt', color: '#d97706', bg: '#fffbeb' },
                          'ACTIVE': { label: 'Đang hoạt động', color: '#16a34a', bg: '#ecfdf5' },
                          'CANCELLED': { label: 'Đã hủy', color: '#dc2626', bg: '#fef2f2' },
                        };
                        const statusInfo = statusMap[p.status || "PENDING"] || { label: p.status || 'Chưa rõ', color: '#4b5563', bg: '#f3f4f6' };

                        return (
                          <Box
                            key={idx}
                            sx={{
                              p: 2.5,
                              border: "1px solid #e5e7eb",
                              borderRadius: 2,
                              bgcolor: "white",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                              transition: "all 0.2s ease-in-out",
                              "&:hover": {
                                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
                                borderColor: "#cbd5e1"
                              }
                            }}
                          >
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                              <Box>
                                <Typography variant="caption" sx={{ color: "#6b7280", fontWeight: "bold", textTransform: "uppercase", tracking: 1 }}>
                                  Hợp đồng #{p.id}
                                </Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#1f2937", mt: 0.5, lineHeight: 1.3 }}>
                                  {p.packageName || `Gói Bảo Hiểm #${p.packageId}`}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                              <Box
                                sx={{
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: "0.75rem",
                                  fontWeight: "bold",
                                  color: statusInfo.color,
                                  bgcolor: statusInfo.bg,
                                  border: `1px solid ${statusInfo.color}20`
                                }}
                              >
                                {statusInfo.label}
                              </Box>
                              <Box
                                sx={{
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: "0.75rem",
                                  fontWeight: "bold",
                                  color: stepInfo.color,
                                  bgcolor: stepInfo.bg,
                                  border: `1px solid ${stepInfo.color}20`
                                }}
                              >
                                Tiến trình: {stepInfo.label}
                              </Box>
                            </Box>

                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, fontSize: "0.85rem", color: "#4b5563" }}>
                              <Box>
                                <span style={{ color: "#9ca3af" }}>Bắt đầu:</span> <strong>{startStr}</strong>
                              </Box>
                              <Box sx={{ textAlign: "right" }}>
                                <span style={{ color: "#9ca3af" }}>Hạn dùng:</span> <strong>{endStr}</strong>
                              </Box>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 0.5 }}>
                                <Typography variant="caption" sx={{ color: "#6b7280", fontWeight: "medium" }}>
                                  Đã thanh toán: {paidPercent}%
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: "bold", color: "#111827" }}>
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.amountPaid || 0)} / {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.totalAmount || 0)}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  height: 8,
                                  width: "100%",
                                  bgcolor: "#f3f4f6",
                                  borderRadius: 999,
                                  overflow: "hidden"
                                }}
                              >
                                <Box
                                  sx={{
                                    height: "100%",
                                    width: `${paidPercent}%`,
                                    bgcolor: "#10b981",
                                    borderRadius: 999,
                                    transition: "width 0.4s ease"
                                  }}
                                />
                              </Box>
                            </Box>

                            {remaining > 0 && (
                              <Button
                                fullWidth
                                size="small"
                                variant="contained"
                                sx={{
                                  mt: 1.5,
                                  bgcolor: "#2563eb",
                                  py: 1,
                                  fontWeight: "bold",
                                  textTransform: "none",
                                  borderRadius: 1.5,
                                  boxShadow: "none",
                                  "&:hover": {
                                    bgcolor: "#1d4ed8",
                                    boxShadow: "none"
                                  }
                                }}
                                onClick={async () => {
                                  await import("@/services/insuranceService").then(
                                    (m) =>
                                      m.insuranceService.makePayment(
                                        p.id,
                                        remaining,
                                      ),
                                  );
                                  loadData();
                                }}
                              >
                                Thanh toán số tiền còn lại ({new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(remaining)})
                              </Button>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography color="text.secondary">
                      Bạn không có hợp đồng hoạt động nào.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Sự Cố Của Tôi
                  </Typography>
                  <IncidentReportForm onSuccess={loadData} />
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Lịch Sử Sự Cố
                    </Typography>
                    {stats?.myIncidents && stats.myIncidents.length > 0 ? (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                        {stats.myIncidents.map((i: any, idx: number) => {
                          const parsedDate = parseJacksonDate(i.reportedAt);
                          const dateStr = parsedDate && !isNaN(parsedDate.getTime())
                            ? parsedDate.toLocaleString("vi-VN", {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : "N/A";

                          // Color/Label mapping for status in Vietnamese
                          const statusMap: Record<string, { label: string; color: string; bg: string }> = {
                            'PENDING': { label: 'Đang xử lý', color: '#d97706', bg: '#fffbeb' },
                            'APPROVED': { label: 'Đã chấp nhận', color: '#16a34a', bg: '#ecfdf5' },
                            'REJECTED': { label: 'Bị từ chối', color: '#dc2626', bg: '#fef2f2' },
                            'RESOLVED': { label: 'Đã giải quyết', color: '#16a34a', bg: '#ecfdf5' }
                          };
                          const statusInfo = statusMap[i.status] || { label: i.status || 'Chưa rõ', color: '#4b5563', bg: '#f3f4f6' };

                          // Color/Label mapping for severity
                          const severityMap: Record<string, { label: string; color: string; bg: string }> = {
                            'LOW': { label: 'Thấp', color: '#10b981', bg: '#ecfdf5' },
                            'MEDIUM': { label: 'Trung bình', color: '#f59e0b', bg: '#fffbeb' },
                            'HIGH': { label: 'Cao', color: '#f97316', bg: '#fff7ed' },
                            'CRITICAL': { label: 'Nghiêm trọng', color: '#ef4444', bg: '#fef2f2' },
                          };
                          const severityInfo = i.severity ? (severityMap[i.severity] || { label: i.severity, color: '#4b5563', bg: '#f3f4f6' }) : null;

                          return (
                            <Box
                              key={idx}
                              sx={{
                                p: 2,
                                border: "1px solid #e5e7eb",
                                borderRadius: 2,
                                bgcolor: "#f9fafb",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                                transition: "all 0.2s ease-in-out",
                                "&:hover": {
                                  borderColor: "#d1d5db",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                                }
                              }}
                            >
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
                                <Box>
                                  <Typography variant="caption" sx={{ color: "#9ca3af", fontWeight: "bold" }}>
                                    SỰ CỐ #{i.id}
                                  </Typography>
                                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#1f2937", mt: 0.2 }}>
                                    {i.title || "Không có tiêu đề sự cố"}
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ display: "flex", gap: 0.8 }}>
                                  {severityInfo && (
                                    <Box
                                      sx={{
                                        px: 1,
                                        py: 0.3,
                                        borderRadius: 1,
                                        fontSize: "0.7rem",
                                        fontWeight: "bold",
                                        color: severityInfo.color,
                                        bgcolor: severityInfo.bg,
                                        border: `1px solid ${severityInfo.color}15`
                                      }}
                                    >
                                      Mức độ: {severityInfo.label}
                                    </Box>
                                  )}
                                  <Box
                                    sx={{
                                      px: 1,
                                      py: 0.3,
                                      borderRadius: 1,
                                      fontSize: "0.7rem",
                                      fontWeight: "bold",
                                      color: statusInfo.color,
                                      bgcolor: statusInfo.bg,
                                      border: `1px solid ${statusInfo.color}15`
                                    }}
                                  >
                                    {statusInfo.label}
                                  </Box>
                                </Box>
                              </Box>

                              <Typography variant="body2" sx={{ color: "#4b5563", whiteSpace: "pre-line", mb: 1.5, bgcolor: "white", p: 1.5, borderRadius: 1, border: "1px solid #f3f4f6" }}>
                                {i.description || "Không có mô tả chi tiết."}
                              </Typography>

                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "#9ca3af" }}>
                                <Box>
                                  📅 Báo cáo lúc: <span style={{ color: "#6b7280", fontWeight: "medium" }}>{dateStr}</span>
                                </Box>
                                {i.attachments && (
                                  <Box sx={{ color: "#2563eb", display: "flex", alignItems: "center", gap: 0.5 }}>
                                    📎 Có tệp đính kèm
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    ) : (
                      <Typography color="text.secondary">
                        Chưa có sự cố nào được báo cáo.
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
      <ChatbotWidget />
    </Box>
  );
};

export default DashboardPage;
