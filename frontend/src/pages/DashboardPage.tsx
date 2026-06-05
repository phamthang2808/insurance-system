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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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

  const [appointments, setAppointments] = useState<any[]>([]);
  const [openAppointmentDialog, setOpenAppointmentDialog] = useState(false);
  const [appointmentReason, setAppointmentReason] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentError, setAppointmentError] = useState("");

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
      let freshUserObj = user;
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
        freshUserObj = freshUser;
        // Update store and localStorage with fresh data
        setUser(freshUser);
        localStorage.setItem("user", JSON.stringify(freshUser));
      }

      // Then load dashboard stats
      const res = await apiClient.get("/dashboard/stats");
      if (res.data?.data) {
        setStats(res.data.data);
      }

      // Fetch customer appointments if role is USER
      if (freshUserObj && freshUserObj.role === "USER") {
        await import("@/services/insuranceService").then((m) => {
          m.insuranceService.getCustomerAppointments(freshUserObj.id).then(setAppointments);
        });
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
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", bgcolor: "#f3f4f6" }}>
      <AppBar position="static" sx={{ bgcolor: "#1f2937", zIndex: 10 }}>
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

      <Container
        maxWidth="lg"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          pt: 2,
          pb: 2,
          height: "calc(100vh - 64px)",
        }}
      >
        {error && (
          <Box
            sx={{
              mb: 1.5,
              p: 1.5,
              bgcolor: "#fee2e2",
              color: "#b91c1c",
              borderRadius: 1,
              border: "1px solid #f87171",
              fontSize: "0.85rem",
              flexShrink: 0,
            }}
          >
            <Typography variant="body2" fontWeight="bold">
              🚨 Cảnh báo: {error}
            </Typography>
          </Box>
        )}

        <Typography variant="h5" sx={{ mb: 1.5, fontWeight: "bold", flexShrink: 0 }}>
          Tổng Quan
        </Typography>

        {isAdmin ? (
          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
            {/* Stats row with 6 columns */}
            <Grid container spacing={1.5} sx={{ mb: 2, flexShrink: 0 }}>
              <Grid item xs={12} sm={4} md={2}>
                <Card sx={{ bgcolor: "#3b82f6", color: "white" }}>
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", opacity: 0.9 }}>Tổng Số Người Dùng</Typography>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mt: 0.5 }}>
                      {stats?.totalUsers || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <Card sx={{ bgcolor: "#10b981", color: "white" }}>
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", opacity: 0.9 }}>Hợp Đồng Hoạt Động</Typography>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mt: 0.5 }}>
                      {stats?.activePolicies || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <Card sx={{ bgcolor: "#0284c7", color: "white" }}>
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", opacity: 0.9 }}>Lịch Hẹn Tư Vấn</Typography>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mt: 0.5 }}>
                      {stats?.totalAppointments || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <Card sx={{ bgcolor: "#f59e0b", color: "white" }}>
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", opacity: 0.9 }}>Tổng Gói Bảo Hiểm</Typography>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mt: 0.5 }}>
                      {stats?.totalPackages || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <Card sx={{ bgcolor: "#ef4444", color: "white" }}>
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", opacity: 0.9 }}>Sự Cố Chờ Xử Lý</Typography>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mt: 0.5 }}>
                      {stats?.pendingIncidents || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <Card sx={{ bgcolor: "#8b5cf6", color: "white" }}>
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", opacity: 0.9 }}>Tổng Doanh Thu</Typography>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mt: 0.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats?.totalRevenue || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Charts grid filling the remaining space */}
            <Grid container spacing={2} sx={{ flexGrow: 1, minHeight: 0, overflow: "hidden" }}>
              <Grid item xs={12} md={4} sx={{ height: "100%" }}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden", p: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", color: "text.primary" }}>
                      Tổng Quan Hệ Thống
                    </Typography>
                    <Box sx={{ flexGrow: 1, minHeight: 0 }}>
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
                          <XAxis dataKey="name" interval={0} tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <RechartsTooltip />
                          <Bar dataKey="value" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4} sx={{ height: "100%" }}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden", p: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", color: "text.primary" }}>
                      Trạng Thái Sự Cố
                    </Typography>
                    <Box sx={{ flexGrow: 1, minHeight: 0 }}>
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
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell fill="#ef4444" />
                            <Cell fill="#10b981" />
                          </Pie>
                          <RechartsTooltip />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4} sx={{ height: "100%" }}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden", p: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", color: "text.primary" }}>
                      Phân Bố Gói Bảo Hiểm
                    </Typography>
                    <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={Object.entries(stats?.packageStats || {}).map(
                              ([name, value]) => ({ name, value }),
                            )}
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
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
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        ) : user?.role === "STAFF" ? (
          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
            {/* Stats row with 6 columns */}
            <Grid container spacing={1.5} sx={{ mb: 2, flexShrink: 0 }}>
              <Grid item xs={12} sm={4} md={2}>
                <Card sx={{ bgcolor: "#8b5cf6", color: "white" }}>
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", opacity: 0.9 }}>Khách Hàng Được Giao</Typography>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mt: 0.5 }}>
                      {stats?.assignedCustomers || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <Card sx={{ bgcolor: "#06b6d4", color: "white" }}>
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", opacity: 0.9 }}>Tổng Hợp Đồng</Typography>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mt: 0.5 }}>
                      {stats?.totalPolicies || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <Card sx={{ bgcolor: "#0284c7", color: "white" }}>
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", opacity: 0.9 }}>Lịch Hẹn Tư Vấn</Typography>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mt: 0.5 }}>
                      {stats?.totalAppointments || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <Card sx={{ bgcolor: "#f43f5e", color: "white" }}>
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", opacity: 0.9 }}>Tổng Sự Cố</Typography>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mt: 0.5 }}>
                      {stats?.totalIncidents || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <Card sx={{ bgcolor: "#eab308", color: "white" }}>
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", opacity: 0.9 }}>Sự Cố Chờ Xử Lý</Typography>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mt: 0.5 }}>
                      {stats?.pendingIncidents || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <Card sx={{ bgcolor: "#22c55e", color: "white" }}>
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", opacity: 0.9 }}>Doanh Thu Cá Nhân</Typography>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mt: 0.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats?.personalSales || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Layout for single chart & Action buttons */}
            <Grid container spacing={2} sx={{ flexGrow: 1, minHeight: 0, overflow: "hidden" }}>
              <Grid item xs={12} md={6} sx={{ height: "100%" }}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden", p: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold", color: "text.primary" }}>
                      Tổng Quan Khối Lượng Cá Nhân
                    </Typography>
                    <Box sx={{ flexGrow: 1, minHeight: 0 }}>
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
                              name: "Lịch Hẹn",
                              value: stats?.totalAppointments || 0,
                            },
                            {
                              name: "Sự Cố",
                              value: stats?.totalIncidents || 0,
                            },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" interval={0} tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <RechartsTooltip />
                          <Bar dataKey="value" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Card sx={{ p: 4, width: "100%", maxWidth: 400, textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: "#1f2937" }}>
                    Không Gian Xử Lý Công Việc
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Xem và phê duyệt các yêu cầu hợp đồng, quản lý báo cáo sự cố và sắp xếp lịch hẹn trực tiếp với khách hàng được giao.
                  </Typography>
                  <StaffActions onActionComplete={loadData} />
                </Card>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ flexGrow: 1, minHeight: 0, overflow: "hidden" }}>
            <Grid item xs={12} md={6} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden", p: 2.5 }}>
                  
                  {/* Internal Scrollable Content Box */}
                  <Box sx={{ flexGrow: 1, overflowY: "auto", pr: 1, display: "flex", flexDirection: "column" }}>
                    
                    <Typography variant="h6" sx={{ mb: 1.5, fontWeight: "bold" }}>
                      Hợp Đồng Của Tôi
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <CustomerActions onActionComplete={loadData} />
                    </Box>

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
                                p: 2,
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
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                                <Box>
                                  <Typography variant="caption" sx={{ color: "#6b7280", fontWeight: "bold", textTransform: "uppercase", tracking: 1 }}>
                                    Hợp đồng #{p.id}
                                  </Typography>
                                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#1f2937", mt: 0.5, lineHeight: 1.3 }}>
                                    {p.packageName || `Gói Bảo Hiểm #${p.packageId}`}
                                  </Typography>
                                </Box>
                              </Box>

                              <Box sx={{ display: "flex", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
                                <Box
                                  sx={{
                                    px: 1,
                                    py: 0.3,
                                    borderRadius: 1,
                                    fontSize: "0.7rem",
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
                                    px: 1,
                                    py: 0.3,
                                    borderRadius: 1,
                                    fontSize: "0.7rem",
                                    fontWeight: "bold",
                                    color: stepInfo.color,
                                    bgcolor: stepInfo.bg,
                                    border: `1px solid ${stepInfo.color}20`
                                  }}
                                >
                                  Tiến trình: {stepInfo.label}
                                </Box>
                              </Box>

                              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5, fontSize: "0.8rem", color: "#4b5563" }}>
                                <Box>
                                  <span style={{ color: "#9ca3af" }}>Bắt đầu:</span> <strong>{startStr}</strong>
                                </Box>
                                <Box sx={{ textAlign: "right" }}>
                                  <span style={{ color: "#9ca3af" }}>Hạn dùng:</span> <strong>{endStr}</strong>
                                </Box>
                              </Box>

                              <Box sx={{ mb: 1.5 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 0.5 }}>
                                  <Typography variant="caption" sx={{ color: "#6b7280", fontWeight: "medium" }}>
                                    Đã thanh toán: {paidPercent}%
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: "bold", color: "#111827", fontSize: "0.85rem" }}>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.amountPaid || 0)} / {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.totalAmount || 0)}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    height: 6,
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
                                    mt: 1,
                                    bgcolor: "#2563eb",
                                    py: 0.5,
                                    fontSize: "0.75rem",
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
                      <Typography color="text.secondary" variant="body2">
                        Bạn không có hợp đồng hoạt động nào.
                      </Typography>
                    )}

                    {/* Lịch Hẹn Của Tôi */}
                    <Divider sx={{ my: 2.5 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1f2937" }}>
                        Lịch Hẹn Của Tôi
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ textTransform: "none", borderRadius: 1.5, fontSize: "0.75rem" }}
                        onClick={() => setOpenAppointmentDialog(true)}
                      >
                        Đặt Lịch Hẹn
                      </Button>
                    </Box>

                    {appointments && appointments.length > 0 ? (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        {appointments.map((app: any, idx: number) => {
                          const date = parseJacksonDate(app.scheduledTime);
                          const dateStr = date && !isNaN(date.getTime())
                            ? date.toLocaleString("vi-VN", {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : "N/A";

                          const statusMap: Record<string, { label: string; color: string; bg: string }> = {
                            'PENDING': { label: 'Chờ duyệt', color: '#d97706', bg: '#fffbeb' },
                            'APPROVED': { label: 'Đã duyệt', color: '#16a34a', bg: '#ecfdf5' },
                            'CANCELLED': { label: 'Đã hủy', color: '#dc2626', bg: '#fef2f2' }
                          };
                          const statusInfo = statusMap[app.status] || { label: app.status || 'Chờ duyệt', color: '#4b5563', bg: '#f3f4f6' };

                          return (
                            <Box
                              key={idx}
                              sx={{
                                p: 1.5,
                                border: "1px solid #e5e7eb",
                                borderRadius: 2,
                                bgcolor: "#f9fafb",
                                transition: "all 0.2s ease",
                                "&:hover": { borderColor: "#cbd5e1" }
                              }}
                            >
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#374151", fontSize: "0.8rem" }}>
                                  📅 {dateStr}
                                </Typography>
                                <Box
                                  sx={{
                                    px: 1,
                                    py: 0.2,
                                    borderRadius: 1,
                                    fontSize: "0.7rem",
                                    fontWeight: "bold",
                                    color: statusInfo.color,
                                    bgcolor: statusInfo.bg,
                                    border: `1px solid ${statusInfo.color}20`
                                  }}
                                >
                                  {statusInfo.label}
                                </Box>
                              </Box>

                              <Typography variant="body2" sx={{ color: "#4b5563", mb: 0.8, fontSize: "0.8rem" }}>
                                <strong>Lý do:</strong> {app.reason}
                              </Typography>

                              {app.staffName && (
                                <Typography variant="caption" sx={{ color: "#6b7280", display: "block", mb: 0.5, fontSize: "0.75rem" }}>
                                  👤 Nhân viên hỗ trợ: <strong>{app.staffName}</strong>
                                </Typography>
                              )}

                              {app.status === 'APPROVED' && app.meetingLink && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  href={app.meetingLink.startsWith('http') ? app.meetingLink : `https://${app.meetingLink}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{ mt: 1, textTransform: "none", borderRadius: 1.5, fontWeight: "bold", fontSize: "0.75rem" }}
                                >
                                  🎥 Tham gia cuộc họp trực tuyến
                                </Button>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    ) : (
                      <Typography color="text.secondary" variant="body2">
                        Bạn không có lịch hẹn tư vấn nào.
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden", p: 2.5 }}>
                  <Typography variant="h6" sx={{ mb: 1.5, fontWeight: "bold" }}>
                    Sự Cố Của Tôi
                  </Typography>
                  
                  {/* Fixed incident form */}
                  <Box sx={{ flexShrink: 0, mb: 2 }}>
                    <IncidentReportForm onSuccess={loadData} />
                  </Box>

                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                    Lịch Sự Sự Cố
                  </Typography>
                  
                  {/* Scrollable incident list */}
                  <Box sx={{ flexGrow: 1, overflowY: "auto", pr: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {stats?.myIncidents && stats.myIncidents.length > 0 ? (
                      stats.myIncidents.map((i: any, idx: number) => {
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

                        const statusMap: Record<string, { label: string; color: string; bg: string }> = {
                          'PENDING': { label: 'Đang xử lý', color: '#d97706', bg: '#fffbeb' },
                          'APPROVED': { label: 'Đã chấp nhận', color: '#16a34a', bg: '#ecfdf5' },
                          'REJECTED': { label: 'Bị từ chối', color: '#dc2626', bg: '#fef2f2' },
                          'RESOLVED': { label: 'Đã giải quyết', color: '#16a34a', bg: '#ecfdf5' }
                        };
                        const statusInfo = statusMap[i.status] || { label: i.status || 'Chưa rõ', color: '#4b5563', bg: '#f3f4f6' };

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
                              p: 1.5,
                              border: "1px solid #e5e7eb",
                              borderRadius: 2,
                              bgcolor: "#f9fafb",
                              transition: "all 0.2s ease-in-out",
                              "&:hover": {
                                borderColor: "#d1d5db"
                              }
                            }}
                          >
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, mb: 1 }}>
                              <Box>
                                <Typography variant="caption" sx={{ color: "#9ca3af", fontWeight: "bold", fontSize: "0.7rem" }}>
                                  SỰ CỐ #{i.id}
                                </Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#1f2937", mt: 0.1, fontSize: "0.8rem" }}>
                                  {i.title || "Không có tiêu đề sự cố"}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                {severityInfo && (
                                  <Box
                                    sx={{
                                      px: 0.8,
                                      py: 0.2,
                                      borderRadius: 1,
                                      fontSize: "0.65rem",
                                      fontWeight: "bold",
                                      color: severityInfo.color,
                                      bgcolor: severityInfo.bg,
                                      border: `1px solid ${severityInfo.color}15`
                                    }}
                                  >
                                    {severityInfo.label}
                                  </Box>
                                )}
                                <Box
                                  sx={{
                                    px: 0.8,
                                    py: 0.2,
                                    borderRadius: 1,
                                    fontSize: "0.65rem",
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

                            <Typography variant="body2" sx={{ color: "#4b5563", fontSize: "0.75rem", mb: 1, p: 1, bgcolor: "white", borderRadius: 1, border: "1px solid #f3f4f6" }}>
                              {i.description || "Không có mô tả chi tiết."}
                            </Typography>

                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.7rem", color: "#9ca3af" }}>
                              <Box>
                                📅 Báo cáo lúc: <span style={{ color: "#6b7280", fontWeight: "medium" }}>{dateStr}</span>
                              </Box>
                              {i.attachments && (
                                <Box sx={{ color: "#2563eb", display: "flex", alignItems: "center", gap: 0.5 }}>
                                  📎 Có tệp
                                </Box>
                              )}
                            </Box>
                          </Box>
                        );
                      })
                    ) : (
                      <Typography color="text.secondary" variant="body2">
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

      {/* Dialog đặt lịch hẹn */}
      <Dialog
        open={openAppointmentDialog}
        onClose={() => setOpenAppointmentDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#1f2937" }}>Đặt Lịch Hẹn Tư Vấn</DialogTitle>
        <DialogContent sx={{ pt: 1.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {appointmentError && (
            <Box sx={{ p: 1.5, bgcolor: "#fee2e2", color: "#b91c1c", borderRadius: 1.5, fontSize: "0.85rem", fontWeight: "medium" }}>
              {appointmentError}
            </Box>
          )}
          
          <Box>
            <Typography variant="body2" sx={{ color: "#4b5563", mb: 1, fontWeight: "medium" }}>
              Chọn ngày giờ hẹn:
            </Typography>
            <TextField
              fullWidth
              type="datetime-local"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          
          <Box>
            <Typography variant="body2" sx={{ color: "#4b5563", mb: 1, fontWeight: "medium" }}>
              Nội dung tư vấn / Lý do hẹn:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Ví dụ: Cần tư vấn thêm về điều khoản hoặc bồi thường gói bảo hiểm..."
              value={appointmentReason}
              onChange={(e) => setAppointmentReason(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
          <Button onClick={() => setOpenAppointmentDialog(false)} sx={{ textTransform: "none", fontWeight: "bold" }} color="inherit">Hủy</Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ textTransform: "none", fontWeight: "bold", borderRadius: 1.5 }}
            disabled={!appointmentTime || !appointmentReason}
            onClick={async () => {
              try {
                setAppointmentError("");
                if (!user) return;
                
                // Get customer's assigned staff ID
                const profileRes = await apiClient.get("/users/profile");
                const assignedStaff = profileRes.data?.data?.assignedStaff;
                const staffId = assignedStaff ? assignedStaff.id : null;

                await import("@/services/insuranceService").then(async (m) => {
                  await m.insuranceService.createAppointment({
                    customerId: user.id,
                    scheduledTime: appointmentTime,
                    reason: appointmentReason,
                    staffId: staffId ? Number(staffId) : undefined
                  });
                });
                
                setOpenAppointmentDialog(false);
                setAppointmentReason("");
                setOpenAppointmentDialog(false);
                setAppointmentTime("");
                
                // Reload appointments list
                import("@/services/insuranceService").then((m) => {
                  m.insuranceService.getCustomerAppointments(user.id).then(setAppointments);
                });
              } catch (e: any) {
                setAppointmentError(e.response?.data?.message || "Không thể đặt lịch hẹn, vui lòng thử lại!");
              }
            }}
          >
            Đăng Ký Lịch
          </Button>
        </DialogActions>
      </Dialog>

      <ChatbotWidget />
    </Box>
  );
};

export default DashboardPage;
