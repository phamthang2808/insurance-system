package com.insurance.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.insurance.entities.UserEntity;
import com.insurance.models.response.ApiResponse;
import com.insurance.services.DashboardService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * Get dashboard statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<?>> getDashboardStats() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserEntity user = (UserEntity) authentication.getPrincipal();
        
        log.info("Getting dashboard stats for user: {}", user.getId());
        
        Object stats;
        if (user.getRole() != null && (user.getRole().getName().equals("ADMIN") || user.getRole().getName().equals("SUPER_ADMIN"))) {
            stats = dashboardService.getAdminStatistics();
        } else if (user.getRole() != null && user.getRole().getName().equals("STAFF")) {
            stats = dashboardService.getStaffDashboardSummary(user.getId());
        } else {
            stats = dashboardService.getCustomerDashboardSummary(user.getId());
        }
        
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved successfully", stats));
    }
}
