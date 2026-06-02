import { PackageManagement } from "@/components/admin/PackageManagement";
import { StaffAssignment } from "@/components/admin/StaffAssignment";
import { adminService } from "@/services/adminService";
import { useAuthStore } from "@/services/authStore";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface AuditLog {
  id: string;
  userId: number;
  userEmail: string;
  action: string;
  timestamp: string;
  status: string;
  details?: string;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  roleBreakdown: Record<string, number>;
}

// Role ID mapping (Note: Ideally this should be fetched from API)
const ROLE_ID_MAP: Record<string, number> = {
  SUPER_ADMIN: 5, // Tạm thời đặt 5, nếu lỗi thì cần fetch list roles từ API
  ADMIN: 1,
  MANAGER: 2,
  STAFF: 3,
  USER: 4,
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<
    "create" | "edit" | "resetPassword" | "changeRole"
  >("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: "",
    role: "USER",
    isActive: true,
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    // Fetch latest profile from server to check role dynamically
    const checkRoleAndLoad = async () => {
      try {
        const profileRes = await import("@/services/apiClient").then((m) =>
          m.default.get("/users/profile"),
        );
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
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));

          // Check with fresh role
          if (freshUser.role !== "ADMIN" && freshUser.role !== "SUPER_ADMIN") {
            navigate("/dashboard");
            return;
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
      loadData();
    };
    checkRoleAndLoad();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, logsData, statsData] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAuditLogs(0, 50),
        adminService.getStatistics(),
      ]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setAuditLogs(
        logsData?.content
          ? logsData.content
          : Array.isArray(logsData)
            ? logsData
            : [],
      );
      setStats(statsData);
      setMessage("");
    } catch (error: any) {
      console.error("Error loading data:", error);
      setMessageType("error");
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to load admin data";
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setDialogMode("create");
    setSelectedUser(null);
    setFormData({
      email: "",
      fullName: "",
      password: "",
      role: "USER",
      isActive: true,
    });
    setOpenDialog(true);
  };

  const handleOpenResetPasswordDialog = (user: User) => {
    setDialogMode("resetPassword");
    setSelectedUser(user);
    setFormData({ ...formData, password: "" });
    setOpenDialog(true);
  };

  const handleOpenChangeRoleDialog = (user: User) => {
    setDialogMode("changeRole");
    setSelectedUser(user);
    setFormData({
      ...formData,
      role: user.role || "USER",
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async () => {
    try {
      if (dialogMode === "create") {
        const roleId = ROLE_ID_MAP[formData.role] || ROLE_ID_MAP.USER;
        await adminService.createUser(
          formData.email,
          formData.fullName,
          formData.password,
          roleId,
        );
        setMessageType("success");
        setMessage("User created successfully");
      } else if (dialogMode === "resetPassword" && selectedUser) {
        await adminService.resetPassword(selectedUser.id, formData.password);
        setMessageType("success");
        setMessage("Password reset successfully");
      } else if (dialogMode === "changeRole" && selectedUser) {
        const roleId = ROLE_ID_MAP[formData.role] || ROLE_ID_MAP.USER;
        await adminService.updateUserRole(selectedUser.id, roleId);
        setMessageType("success");
        setMessage("User role updated successfully");
      }
      loadData();
      handleCloseDialog();
    } catch (error: any) {
      console.error("Error saving user:", error);
      setMessageType("error");
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      setMessage(`Failed: ${errorMessage}`);
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      await adminService.updateUserStatus(user.id, !user.isActive);
      setMessageType("success");
      setMessage(`User ${user.isActive ? "disabled" : "enabled"} successfully`);
      loadData();
    } catch (error: any) {
      console.error("Error updating user status:", error);
      setMessageType("error");
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update user status";
      setMessage(`Error: ${errorMessage}`);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.email}?`)) {
      try {
        await adminService.deleteUser(user.id);
        setMessageType("success");
        setMessage("User deleted successfully");
        loadData();
      } catch (error: any) {
        console.error("Error deleting user:", error);
        setMessageType("error");
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to delete user";
        setMessage(`Error: ${errorMessage}`);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading && !users.length) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <AppBar position="static">
        <Toolbar sx={{ flexWrap: "wrap", gap: 1, py: { xs: 1, sm: 0 } }}>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontSize: { xs: "0.9rem", sm: "1.25rem" } }}
          >
            👨‍💼 Bảng Điều Khiển Admin
          </Typography>
          <Typography
            variant="body2"
            sx={{ mr: 1, display: { xs: "none", md: "block" } }}
          >
            {user?.email}
          </Typography>
          <Button color="inherit" size="small" onClick={handleLogout}>
            Đăng Xuất
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {message && (
          <Alert severity={messageType} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label="📊 Thống Kê" />
            <Tab label="👥 Quản Lý Người Dùng" />
            <Tab label="📋 Lịch Sử Truy Cập" />
            <Tab label="📦 Gói Bảo Hiểm" />
            <Tab label="👨‍💼 Giao Nhân Viên" />
          </Tabs>
        </Paper>

        {/* Statistics Tab */}
        <TabPanel value={tabValue} index={0}>
          {stats ? (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: "#6366f1", color: "white" }}>
                  <CardContent>
                    <Typography color="inherit" sx={{ mb: 1 }}>
                      Tổng Người Dùng
                    </Typography>
                    <Typography variant="h4">{stats.totalUsers}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: "#10b981", color: "white" }}>
                  <CardContent>
                    <Typography color="inherit" sx={{ mb: 1 }}>
                      Người Dùng Hoạt Động
                    </Typography>
                    <Typography variant="h4">{stats.activeUsers}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: "#f59e0b", color: "white" }}>
                  <CardContent>
                    <Typography color="inherit" sx={{ mb: 1 }}>
                      Người Dùng Không Hoạt Động
                    </Typography>
                    <Typography variant="h4">{stats.inactiveUsers}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: "#3b82f6", color: "white" }}>
                  <CardContent>
                    <Typography color="inherit" sx={{ mb: 1 }}>
                      Phân Bố Vai Trò
                    </Typography>
                    <Typography variant="body2">
                      {Object.entries(stats.roleBreakdown).map(
                        ([role, count]) => (
                          <div key={role}>
                            {role}: {count}
                          </div>
                        ),
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <CircularProgress />
          )}
        </TabPanel>

        {/* Users Management Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              onClick={handleOpenCreateDialog}
              sx={{ textTransform: "none" }}
            >
              ➕ Tạo Người Dùng Mới
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 600 }}>
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      display: { xs: "none", sm: "table-cell" },
                    }}
                  >
                    Tên Đầy Đủ
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Vai Trò</TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      display: { xs: "none", sm: "table-cell" },
                    }}
                  >
                    Trạng Thái
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      display: { xs: "none", md: "table-cell" },
                    }}
                  >
                    Ngày Tạo
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    Hành Động
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell
                      sx={{
                        maxWidth: 160,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.email}
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: "none", sm: "table-cell" } }}
                    >
                      {user.fullName}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          px: 1,
                          py: 0.5,
                          backgroundColor:
                            user.role === "SUPER_ADMIN"
                              ? "#fbcfe8"
                              : user.role === "ADMIN"
                                ? "#fecaca"
                                : user.role === "STAFF"
                                  ? "#bfdbfe"
                                  : "#dbeafe",
                          borderRadius: 1,
                          display: "inline-block",
                          fontSize: "0.75rem",
                        }}
                      >
                        {user.role}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: "none", sm: "table-cell" } }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          px: 1,
                          py: 0.5,
                          backgroundColor: user.isActive
                            ? "#d1fae5"
                            : "#fee2e2",
                          color: user.isActive ? "#065f46" : "#991b1b",
                          borderRadius: 1,
                          display: "inline-block",
                          fontSize: "0.75rem",
                        }}
                      >
                        {user.isActive ? "Hoạt Động" : "Không Hoạt Động"}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        display: { xs: "none", md: "table-cell" },
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.createdAt
                        ? format(new Date(user.createdAt), "dd/MM/yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenChangeRoleDialog(user)}
                          sx={{ textTransform: "none", fontSize: "0.7rem" }}
                        >
                          Vai Trò
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenResetPasswordDialog(user)}
                          sx={{ textTransform: "none", fontSize: "0.7rem" }}
                        >
                          Mật Khẩu
                        </Button>
                        <Button
                          size="small"
                          variant={user.isActive ? "outlined" : "contained"}
                          color={user.isActive ? "error" : "success"}
                          onClick={() => handleToggleUserStatus(user)}
                          sx={{ textTransform: "none", fontSize: "0.7rem" }}
                        >
                          {user.isActive ? "Vô Hiệu Hóa" : "Kích Hoạt"}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteUser(user)}
                          sx={{ textTransform: "none", fontSize: "0.7rem" }}
                        >
                          Xóa
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Access History Tab */}
        <TabPanel value={tabValue} index={2}>
          <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 540 }}>
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Email Người Dùng
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Hành Động</TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      display: { xs: "none", sm: "table-cell" },
                    }}
                  >
                    Thời Gian
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Trạng Thái</TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      display: { xs: "none", md: "table-cell" },
                    }}
                  >
                    Chi Tiết
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{ py: 4, color: "text.secondary" }}
                    >
                      Chưa có lịch sử truy cập nào
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell
                        sx={{
                          maxWidth: 140,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {log.userEmail}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, fontSize: "0.75rem" }}
                        >
                          {log.action.replace(/_/g, " ").toUpperCase()}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          display: { xs: "none", sm: "table-cell" },
                          whiteSpace: "nowrap",
                        }}
                      >
                        {log.timestamp
                          ? (() => {
                              try {
                                return format(
                                  new Date(log.timestamp),
                                  "dd/MM/yyyy HH:mm:ss",
                                );
                              } catch {
                                return log.timestamp;
                              }
                            })()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            px: 1,
                            py: 0.5,
                            backgroundColor:
                              log.status === "success" ? "#d1fae5" : "#fee2e2",
                            color:
                              log.status === "success" ? "#065f46" : "#991b1b",
                            borderRadius: 1,
                            display: "inline-block",
                            fontSize: "0.75rem",
                          }}
                        >
                          {log.status === "success" ? "Thành Công" : "Thất Bại"}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: "none", md: "table-cell" } }}
                      >
                        {log.details || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Packages Management Tab */}
        <TabPanel value={tabValue} index={3}>
          <PackageManagement />
        </TabPanel>

        {/* Staff Assignment Tab */}
        <TabPanel value={tabValue} index={4}>
          <StaffAssignment />
        </TabPanel>
      </Container>

      {/* Create/Reset Password Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === "create"
            ? "Create New User"
            : dialogMode === "resetPassword"
              ? `Reset Password for ${selectedUser?.email}`
              : `Change Role for ${selectedUser?.email}`}
        </DialogTitle>
        <DialogContent
          sx={{ pt: 3, display: "flex", flexDirection: "column", gap: 2 }}
        >
          {dialogMode === "create" && (
            <>
              <TextField
                label="Email"
                fullWidth
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <TextField
                label="Full Name"
                fullWidth
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <TextField
                select
                label="Role"
                fullWidth
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <MenuItem value="USER">User</MenuItem>
                <MenuItem value="STAFF">Staff</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
                {user?.role === "SUPER_ADMIN" && (
                  <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
                )}
              </TextField>
            </>
          )}
          {dialogMode === "resetPassword" && (
            <TextField
              label="New Password"
              type="password"
              fullWidth
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          )}
          {dialogMode === "changeRole" && (
            <TextField
              select
              label="New Role"
              fullWidth
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <MenuItem value="USER">User</MenuItem>
              <MenuItem value="STAFF">Staff</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
              {user?.role === "SUPER_ADMIN" && (
                <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
              )}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={
              (dialogMode === "create" &&
                (!formData.email ||
                  !formData.fullName ||
                  !formData.password)) ||
              (dialogMode === "resetPassword" && !formData.password) ||
              (dialogMode === "changeRole" && !formData.role)
            }
          >
            {dialogMode === "create"
              ? "Create"
              : dialogMode === "resetPassword"
                ? "Reset"
                : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPage;
