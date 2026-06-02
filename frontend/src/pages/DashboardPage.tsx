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
import apiClient from "@/services/apiClient";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { CustomerActions } from "@/components/customer/CustomerActions";
import { StaffActions } from "@/components/staff/StaffActions";
import { IncidentReportForm } from "@/components/customer/IncidentReportForm";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error("Failed to load dashboard:", error);
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
            🛡️ Insurance System Dashboard
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, {user?.email} ({user?.role})
          </Typography>
          {isAdmin && (
            <Button
              color="inherit"
              onClick={() => navigate("/admin")}
              sx={{ mr: 2 }}
            >
              Admin Panel
            </Button>
          )}
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
          Overview
        </Typography>

        {isAdmin ? (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#3b82f6", color: "white" }}>
                  <CardContent>
                    <Typography variant="h6">Total Users</Typography>
                    <Typography variant="h3">{stats?.totalUsers || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#10b981", color: "white" }}>
                  <CardContent>
                    <Typography variant="h6">Active Policies</Typography>
                    <Typography variant="h3">{stats?.activePolicies || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#f59e0b", color: "white" }}>
                  <CardContent>
                    <Typography variant="h6">Total Packages</Typography>
                    <Typography variant="h3">{stats?.totalPackages || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#ef4444", color: "white" }}>
                  <CardContent>
                    <Typography variant="h6">Pending Incidents</Typography>
                    <Typography variant="h3">{stats?.pendingIncidents || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ bgcolor: "#8b5cf6", color: "white" }}>
                  <CardContent>
                    <Typography variant="h6">Total Revenue</Typography>
                    <Typography variant="h3">${stats?.totalRevenue || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>System Overview</Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'Users', value: stats?.totalUsers || 0 },
                          { name: 'Policies', value: stats?.activePolicies || 0 },
                          { name: 'Packages', value: stats?.totalPackages || 0 },
                          { name: 'Incidents', value: stats?.totalIncidents || 0 },
                        ]}>
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
                    <Typography variant="h6" sx={{ mb: 2 }}>Incidents Status</Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Pending', value: stats?.pendingIncidents || 0 },
                              { name: 'Resolved', value: (stats?.totalIncidents || 0) - (stats?.pendingIncidents || 0) },
                            ]}
                            cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
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
                    <Typography variant="h6" sx={{ mb: 2 }}>Packages Distribution</Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={Object.entries(stats?.packageStats || {}).map(([name, value]) => ({ name, value }))}
                            cx="50%" cy="50%" outerRadius={80} dataKey="value"
                          >
                            {Object.entries(stats?.packageStats || {}).map((_, index) => (
                              <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                            ))}
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
                    <Typography variant="h6">Assigned Customers</Typography>
                    <Typography variant="h3">{stats?.assignedCustomers || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#06b6d4", color: "white" }}>
                  <CardContent>
                    <Typography variant="h6">Total Policies</Typography>
                    <Typography variant="h3">{stats?.totalPolicies || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#f43f5e", color: "white" }}>
                  <CardContent>
                    <Typography variant="h6">Total Incidents</Typography>
                    <Typography variant="h3">{stats?.totalIncidents || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#eab308", color: "white" }}>
                  <CardContent>
                    <Typography variant="h6">Pending Incidents</Typography>
                    <Typography variant="h3">{stats?.pendingIncidents || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ bgcolor: "#22c55e", color: "white" }}>
                  <CardContent>
                    <Typography variant="h6">Personal Sales</Typography>
                    <Typography variant="h3">${stats?.personalSales || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>My Workload Overview</Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'Customers', value: stats?.assignedCustomers || 0 },
                          { name: 'Policies', value: stats?.totalPolicies || 0 },
                          { name: 'Incidents', value: stats?.totalIncidents || 0 },
                        ]}>
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
                  <Typography variant="h6" sx={{ mb: 2 }}>My Policies</Typography>
                  <CustomerActions onActionComplete={loadData} />
                  {stats?.myPolicies && stats.myPolicies.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {stats.myPolicies.map((p, idx) => {
                        const remaining = (p.totalAmount || 0) - (p.amountPaid || 0);
                        return (
                          <Box key={idx} sx={{ p: 2, border: '1px solid #e5e7eb', borderRadius: 1 }}>
                            <Typography variant="subtitle1">Policy #{p.id} - Package #{p.packageId}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Status: <b>{p.status}</b> | Step: <b>{p.processStep || 'RECEIVING'}</b>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Paid: ${p.amountPaid || 0} / ${p.totalAmount || 0}
                            </Typography>
                            {remaining > 0 && (
                              <Button 
                                size="small" variant="contained" sx={{ mt: 1 }}
                                onClick={async () => {
                                  await import('@/services/insuranceService').then(m => m.insuranceService.makePayment(p.id, remaining));
                                  loadData();
                                }}
                              >
                                Pay Remaining ${remaining}
                              </Button>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography color="text.secondary">You don't have any active policies.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>My Incidents</Typography>
                  <IncidentReportForm onSuccess={loadData} />
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" fontWeight="bold">Lịch sử sự cố</Typography>
                    {stats?.myIncidents && stats.myIncidents.length > 0 ? (
                      <ul>
                        {stats.myIncidents.map((i: any, idx: number) => (
                          <li key={idx}>Incident #{i.id} - {i.title || i.description?.substring(0,20)} - Status: {i.status} - {new Date(i.reportedAt).toLocaleDateString()}</li>
                        ))}
                      </ul>
                    ) : (
                      <Typography color="text.secondary">No incidents reported.</Typography>
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
