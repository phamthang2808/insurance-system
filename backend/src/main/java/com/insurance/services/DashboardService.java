package com.insurance.services;

import com.insurance.repositories.CustomerPolicyRepository;
import com.insurance.repositories.IncidentReportRepository;
import com.insurance.repositories.InsurancePackageRepository;
import com.insurance.repositories.UserRepository;
import com.insurance.repositories.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final UserRepository userRepository;
    private final CustomerPolicyRepository policyRepository;
    private final IncidentReportRepository incidentRepository;
    private final InsurancePackageRepository packageRepository;
    private final AppointmentRepository appointmentRepository;
    private final CustomerPolicyService policyService;
    private final IncidentReportService incidentService;
    private final RedisTemplate<String, Object> redisTemplate;

    @SuppressWarnings("unchecked")
    public Map<String, Object> getAdminStatistics() {
        String cacheKey = "dashboard:admin";
        try {
            Map<String, Object> cached = (Map<String, Object>) redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                log.info("Fetching admin statistics from Redis cache");
                return cached;
            }
        } catch (Exception e) {
            log.error("Failed to read admin statistics from Redis cache, falling back to database", e);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("activePolicies", policyRepository.countByStatus("ACTIVE"));
        stats.put("totalIncidents", incidentRepository.count());
        stats.put("pendingIncidents", incidentRepository.countByStatus("PENDING"));
        stats.put("totalPackages", packageRepository.count());
        stats.put("totalAppointments", appointmentRepository.count());
        
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
        
        try {
            redisTemplate.opsForValue().set(cacheKey, stats, 5, TimeUnit.MINUTES);
            log.info("Successfully cached admin statistics in Redis");
        } catch (Exception e) {
            log.error("Failed to write admin statistics to Redis cache", e);
        }

        return stats;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getStaffDashboardSummary(Long staffId) {
        String cacheKey = "dashboard:staff:" + staffId;
        try {
            Map<String, Object> cached = (Map<String, Object>) redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                log.info("Fetching staff statistics from Redis cache for staffId: {}", staffId);
                return cached;
            }
        } catch (Exception e) {
            log.error("Failed to read staff statistics from Redis cache for staffId: {}, falling back to DB", staffId, e);
        }

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
        summary.put("totalAppointments", appointmentRepository.countByStaffId(staffId));
        
        try {
            redisTemplate.opsForValue().set(cacheKey, summary, 5, TimeUnit.MINUTES);
            log.info("Successfully cached staff statistics in Redis for staffId: {}", staffId);
        } catch (Exception e) {
            log.error("Failed to write staff statistics to Redis cache for staffId: {}", staffId, e);
        }

        return summary;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getCustomerDashboardSummary(Long userId) {
        String cacheKey = "dashboard:customer:" + userId;
        try {
            Map<String, Object> cached = (Map<String, Object>) redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                log.info("Fetching customer statistics from Redis cache for userId: {}", userId);
                return cached;
            }
        } catch (Exception e) {
            log.error("Failed to read customer statistics from Redis cache for userId: {}, falling back to DB", userId, e);
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("myPolicies", policyService.getPoliciesByCustomerId(userId));
        summary.put("myIncidents", incidentService.getIncidentsByCustomerId(userId));
        summary.put("totalAppointments", appointmentRepository.countByCustomerId(userId));
        
        try {
            redisTemplate.opsForValue().set(cacheKey, summary, 5, TimeUnit.MINUTES);
            log.info("Successfully cached customer statistics in Redis for userId: {}", userId);
        } catch (Exception e) {
            log.error("Failed to write customer statistics to Redis cache for userId: {}", userId, e);
        }

        return summary;
    }

    public void clearDashboardCache() {
        try {
            java.util.Set<String> keys = redisTemplate.keys("dashboard:*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.info("Evicted all dashboard statistics caches from Redis: {}", keys);
            }
        } catch (Exception e) {
            log.error("Failed to clear dashboard statistics cache in Redis", e);
        }
    }
}
