import apiClient from "./apiClient";

export interface InsurancePackage {
  id: number;
  name: string;
  description: string;
  terms: string;
  price: number;
  status: string;
  processSteps?: string;
}

export interface CustomerPolicy {
  id: number;
  customerId: number;
  customerName: string;
  packageId: number;
  packageName: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface IncidentReport {
  id: number;
  customerId: number;
  customerName: string;
  description: string;
  attachments: string;
  status: string;
  reportedAt: string;
}

export const insuranceService = {
  // Packages
  getAllPackages: async () => {
    const response = await apiClient.get("/packages");
    return response.data.data;
  },
  createPackage: async (data: Partial<InsurancePackage>) => {
    const response = await apiClient.post("/packages", data);
    return response.data.data;
  },
  updatePackage: async (id: number, data: Partial<InsurancePackage>) => {
    const response = await apiClient.put(`/packages/${id}`, data);
    return response.data.data;
  },
  deletePackage: async (id: number) => {
    const response = await apiClient.delete(`/packages/${id}`);
    return response.data.data;
  },

  // Policies
  getAllPolicies: async () => {
    const response = await apiClient.get("/policies");
    return response.data.data;
  },
  getCustomerPolicies: async (customerId: number) => {
    const response = await apiClient.get(`/policies/customer/${customerId}`);
    return response.data.data;
  },
  createPolicy: async (data: Partial<CustomerPolicy>) => {
    const response = await apiClient.post("/policies", data);
    return response.data.data;
  },
  updatePolicyStatus: async (id: number, status: string) => {
    const response = await apiClient.put(`/policies/${id}/status?status=${status}`);
    return response.data.data;
  },
  advancePolicyStep: async (id: number) => {
    const response = await apiClient.put(`/policies/${id}/advance-step`);
    return response.data.data;
  },
  makePayment: async (id: number, amount: number) => {
    const response = await apiClient.put(`/policies/${id}/pay?amount=${amount}`);
    return response.data.data;
  },

  // Notes (Consultation Notes)
  getNotesByCustomer: async (customerId: number) => {
    const response = await apiClient.get(`/notes/customer/${customerId}`);
    return response.data.data;
  },
  getNotesByStaff: async (staffId: number) => {
    const response = await apiClient.get(`/notes/staff/${staffId}`);
    return response.data.data;
  },
  createNote: async (staffId: number, customerId: number, note: string) => {
    const response = await apiClient.post("/notes", { staffId, customerId, note });
    return response.data.data;
  },

  // Incidents
  getAllIncidents: async () => {
    const response = await apiClient.get("/incidents");
    return response.data.data;
  },
  getCustomerIncidents: async (customerId: number) => {
    const response = await apiClient.get(`/incidents/customer/${customerId}`);
    return response.data.data;
  },
  createIncident: async (data: Partial<IncidentReport>) => {
    const response = await apiClient.post("/incidents", data);
    return response.data.data;
  },
  updateIncidentStatus: async (id: number, status: string) => {
    const response = await apiClient.put(`/incidents/${id}/status?status=${status}`);
    return response.data.data;
  },
};
