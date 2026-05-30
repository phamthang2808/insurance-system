export interface User {
  id: number;
  email: string;
  name: string;
  photoUrl?: string;
  createdAt: string;
  lastLogin?: string;
  active: boolean;
  role?: string;
}

export interface Company {
  id: number;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  active: boolean;
}

export interface InsurancePackage {
  id: number;
  name: string;
  description: string;
  terms: string;
  price: number;
  status: string;
  processSteps?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerPolicy {
  id: number;
  customerId: number;
  packageId: number;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount?: number;
  amountPaid?: number;
  processStep?: string;
}

export interface IncidentReport {
  id: number;
  customerId: number;
  description: string;
  attachments?: string;
  status: string;
  reportedAt: string;
}

export interface DashboardStats {
  totalUsers?: number;
  activePolicies?: number;
  totalIncidents?: number;
  pendingIncidents?: number;
  totalPackages?: number;
  // Staff
  assignedCustomers?: number;
  totalPolicies?: number;
  // Customer
  myPolicies?: CustomerPolicy[];
  myIncidents?: IncidentReport[];
}

export interface GoogleLoginResponse {
  clientId: string;
  credential: string;
}
