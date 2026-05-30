package com.insurance.controllers;

import com.insurance.models.dto.CustomerPolicyDTO;
import com.insurance.models.response.ApiResponse;
import com.insurance.services.CustomerPolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class CustomerPolicyController {

    private final CustomerPolicyService policyService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<List<CustomerPolicyDTO>>> getAllPolicies() {
        return ResponseEntity.ok(ApiResponse.success("Success", policyService.getAllPolicies()));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF', 'USER')")
    public ResponseEntity<ApiResponse<List<CustomerPolicyDTO>>> getPoliciesByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(ApiResponse.success("Success", policyService.getPoliciesByCustomerId(customerId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF', 'USER')")
    public ResponseEntity<ApiResponse<CustomerPolicyDTO>> createPolicy(@RequestBody CustomerPolicyDTO request) {
        return ResponseEntity.ok(ApiResponse.success("Policy created", policyService.createPolicy(request)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<CustomerPolicyDTO>> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", policyService.updatePolicyStatus(id, status)));
    }

    @PutMapping("/{id}/advance-step")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<CustomerPolicyDTO>> advanceStep(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Step advanced", policyService.advanceProcessStep(id)));
    }

    @PutMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF', 'USER')")
    public ResponseEntity<ApiResponse<CustomerPolicyDTO>> makePayment(@PathVariable Long id, @RequestParam Double amount) {
        return ResponseEntity.ok(ApiResponse.success("Payment recorded", policyService.makePayment(id, amount)));
    }
}
