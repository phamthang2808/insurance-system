import apiClient from "./apiClient";

interface AuditLog {
  id: string;
  userId: number;
  userEmail: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  details: string;
  status: string;
  errorMessage?: string;
}

interface AdminStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  roleBreakdown: Record<string, number>;
}

export const adminService = {
  // User Management
  getAllUsers: async () => {
    const response = await apiClient.get("/admin/users");
    return response.data.data || [];
  },

  getUserById: async (userId: number) => {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data.data;
  },

  createUser: async (
    email: string,
    fullName: string,
    password: string,
    roleId: number,
  ) => {
    const response = await apiClient.post("/admin/users", {
      email,
      fullName,
      password,
      roleId,
    });
    return response.data.data;
  },

  updateUserRole: async (userId: number, roleId: number) => {
    const response = await apiClient.put(`/admin/users/${userId}/role`, {
      roleId: roleId.toString(),
    });
    return response.data.data;
  },

  updateUserStatus: async (userId: number, isActive: boolean) => {
    const response = await apiClient.put(`/admin/users/${userId}/status`, {
      isActive,
    });
    return response.data.data;
  },

  resetPassword: async (userId: number, password: string) => {
    const response = await apiClient.post(
      `/admin/users/${userId}/reset-password`,
      {
        password,
      },
    );
    return response.data.data;
  },

  deleteUser: async (userId: number) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data.data;
  },

  // Audit Logs
  getAuditLogs: async (page: number = 0, size: number = 20) => {
    const response = await apiClient.get(
      `/admin/audit-logs?page=${page}&size=${size}`,
    );
    return response.data.data;
  },

  getUserAuditLogs: async (userId: number) => {
    const response = await apiClient.get(`/admin/audit-logs/user/${userId}`);
    return response.data.data || [];
  },

  // Statistics
  getStatistics: async (): Promise<AdminStatistics> => {
    const response = await apiClient.get("/admin/statistics");
    return response.data.data;
  },

  assignStaff: async (userId: number, staffId: number) => {
    const response = await apiClient.put(`/admin/users/${userId}/assign-staff/${staffId}`);
    return response.data.data;
  },

  getAssignedCustomers: async (staffId: number) => {
    const response = await apiClient.get(`/admin/staff/${staffId}/customers`);
    return response.data.data;
  },
};
