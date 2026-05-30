package com.insurance.services;

import com.insurance.repositories.CustomerPolicyRepository;
import com.insurance.repositories.IncidentReportRepository;
import com.insurance.repositories.InsurancePackageRepository;
import com.insurance.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final CustomerPolicyRepository policyRepository;
    private final IncidentReportRepository incidentRepository;
    private final InsurancePackageRepository packageRepository;

    public Map<String, Object> getAdminStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("activePolicies", policyRepository.countByStatus("ACTIVE"));
        stats.put("totalIncidents", incidentRepository.count());
        stats.put("pendingIncidents", incidentRepository.countByStatus("PENDING"));
        stats.put("totalPackages", packageRepository.count());
        
        // Thống kê doanh thu
        double totalRevenue = policyRepository.findAll().stream()
                .mapToDouble(p -> p.getAmountPaid() != null ? p.getAmountPaid() : 0.0)
                .sum();
        stats.put("totalRevenue", totalRevenue);
        
        // Tỷ lệ gói bảo hiểm được mua
        Map<String, Long> packageStats = policyRepository.findAll().stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        p -> p.getInsurancePackage().getName(),
                        java.util.stream.Collectors.counting()
                ));
        stats.put("packageStats", packageStats);
        
        return stats;
    }

    public Map<String, Object> getStaffDashboardSummary(Long staffId) {
        Map<String, Object> summary = new HashMap<>();
        
        List<Long> assignedCustomerIds = userRepository.findAll().stream()
                .filter(u -> u.getAssignedStaff() != null && u.getAssignedStaff().getId().equals(staffId))
                .map(u -> u.getId())
                .collect(java.util.stream.Collectors.toList());

        long totalPolicies = 0;
        long totalIncidents = 0;
        long pendingIncidents = 0;
        double personalSales = 0.0;

        for (Long custId : assignedCustomerIds) {
            List<com.insurance.entities.CustomerPolicy> policies = policyRepository.findByCustomerId(custId);
            totalPolicies += policies.size();
            personalSales += policies.stream().mapToDouble(p -> p.getAmountPaid() != null ? p.getAmountPaid() : 0.0).sum();
            
            List<com.insurance.entities.IncidentReport> incidents = incidentRepository.findByCustomerId(custId);
            totalIncidents += incidents.size();
            pendingIncidents += incidents.stream().filter(i -> "PENDING".equals(i.getStatus())).count();
        }

        summary.put("assignedCustomers", assignedCustomerIds.size());
        summary.put("totalPolicies", totalPolicies);
        summary.put("totalIncidents", totalIncidents);
        summary.put("pendingIncidents", pendingIncidents);
        summary.put("personalSales", personalSales);
        
        return summary;
    }

    public Map<String, Object> getCustomerDashboardSummary(Long userId) {
        Map<String, Object> summary = new HashMap<>();
        
        summary.put("myPolicies", policyRepository.findByCustomerId(userId));
        summary.put("myIncidents", incidentRepository.findByCustomerId(userId));
        
        return summary;
    }
}
