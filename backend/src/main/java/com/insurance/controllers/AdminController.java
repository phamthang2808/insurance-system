package com.insurance.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.insurance.components.LocalizationUtils;
import com.insurance.models.dto.AuditLogDTO;
import com.insurance.models.request.CreateUserRequest;
import com.insurance.models.request.ResetPasswordRequest;
import com.insurance.models.request.UpdateRoleRequest;
import com.insurance.models.request.UpdateStatusRequest;
import com.insurance.models.response.ApiResponse;
import com.insurance.models.response.UserResponse;
import com.insurance.services.AuditLogService;
import com.insurance.services.UserService;
import com.insurance.utils.MessageKeys;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AdminController {

    private final UserService userService;
    private final AuditLogService auditLogService;
    private final LocalizationUtils localizationUtils;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        String message = localizationUtils.getLocalizedMessage(MessageKeys.SUCCESS);
        return ResponseEntity.ok(ApiResponse.success(message, users));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable Long userId) {
        UserResponse user = userService.getUserById(userId);
        String message = localizationUtils.getLocalizedMessage(MessageKeys.SUCCESS);
        return ResponseEntity.ok(ApiResponse.success(message, user));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@RequestBody CreateUserRequest request) {
        log.info("Creating new user: {}", request.getEmail());
        UserResponse user = userService.createUser(request);
        auditLogService.logCurrentAdminAction("create_user", "Created user: " + request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("User created successfully", user));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable Long userId,
            @RequestBody UpdateRoleRequest request) {
        log.info("Updating user {} role to {}", userId, request.getRoleId());
        UserResponse user = userService.updateUserRole(userId, request.getRoleId());
        auditLogService.logCurrentAdminAction("update_user_role", "Updated user " + userId + " role to " + request.getRoleId());
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", user));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable Long userId,
            @RequestBody UpdateStatusRequest request) {
        log.info("Updating user {} status to {}", userId, request.getIsActive());
        UserResponse user = userService.updateUserStatus(userId, request.getIsActive());
        auditLogService.logCurrentAdminAction("update_user_status", "Updated user " + userId + " status to " + request.getIsActive());
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", user));
    }

    @PostMapping("/users/{userId}/reset-password")
    public ResponseEntity<ApiResponse<Map<String, String>>> resetPassword(
            @PathVariable Long userId,
            @RequestBody ResetPasswordRequest request) {
        log.info("Resetting password for user {}", userId);
        userService.resetUserPassword(userId, request.getPassword());
        auditLogService.logCurrentAdminAction("reset_password", "Reset password for user " + userId);
        
        Map<String, String> result = new HashMap<>();
        result.put("message", "Password reset successfully");
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully", result));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> deleteUser(@PathVariable Long userId) {
        log.info("Deleting user {}", userId);
        userService.deleteUser(userId);
        auditLogService.logCurrentAdminAction("delete_user", "Deleted user " + userId);
        
        Map<String, Boolean> result = new HashMap<>();
        result.put("success", true);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", result));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<Page<AuditLogDTO>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AuditLogDTO> logs = auditLogService.getAllAuditLogs(page, size);
        String message = localizationUtils.getLocalizedMessage(MessageKeys.SUCCESS);
        return ResponseEntity.ok(ApiResponse.success(message, logs));
    }

    @GetMapping("/audit-logs/user/{userId}")
    public ResponseEntity<ApiResponse<List<AuditLogDTO>>> getUserAuditLogs(@PathVariable Long userId) {
        List<AuditLogDTO> logs = auditLogService.getUserAuditLogs(userId);
        String message = localizationUtils.getLocalizedMessage(MessageKeys.SUCCESS);
        return ResponseEntity.ok(ApiResponse.success(message, logs));
    }

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatistics() {
        Map<String, Object> statistics = new HashMap<>();
        
        List<UserResponse> allUsers = userService.getAllUsers();
        statistics.put("totalUsers", allUsers.size());
        statistics.put("activeUsers", allUsers.stream().filter(u -> u.getIsActive()).count());
        statistics.put("inactiveUsers", allUsers.stream().filter(u -> !u.getIsActive()).count());
        
        Map<String, Long> roleBreakdown = allUsers.stream()
            .collect(Collectors.groupingBy(u -> u.getRole() != null ? u.getRole() : "UNKNOWN", Collectors.counting()));
        statistics.put("roleBreakdown", roleBreakdown);
        
        return ResponseEntity.ok(ApiResponse.success("Statistics retrieved", statistics));
    }

    @PutMapping("/users/{userId}/assign-staff/{staffId}")
    public ResponseEntity<ApiResponse<UserResponse>> assignStaffToCustomer(
            @PathVariable Long userId,
            @PathVariable Long staffId) {
        log.info("Assigning staff {} to customer {}", staffId, userId);
        UserResponse user = userService.assignStaffToCustomer(userId, staffId);
        auditLogService.logCurrentAdminAction("assign_staff", "Assigned staff " + staffId + " to customer " + userId);
        return ResponseEntity.ok(ApiResponse.success("Staff assigned successfully", user));
    }

    @GetMapping("/staff/{staffId}/customers")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAssignedCustomers(@PathVariable Long staffId) {
        List<UserResponse> customers = userService.getAssignedCustomers(staffId);
        return ResponseEntity.ok(ApiResponse.success("Success", customers));
    }
}
