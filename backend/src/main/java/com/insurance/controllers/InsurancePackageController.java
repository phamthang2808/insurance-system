package com.insurance.controllers;

import com.insurance.entities.InsurancePackage;
import com.insurance.models.response.ApiResponse;
import com.insurance.services.InsurancePackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class InsurancePackageController {

    private final InsurancePackageService packageService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<InsurancePackage>>> getAllPackages() {
        return ResponseEntity.ok(ApiResponse.success("Success", packageService.getAllPackages()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InsurancePackage>> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Success", packageService.getPackageById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<InsurancePackage>> createPackage(@RequestBody InsurancePackage request) {
        return ResponseEntity.ok(ApiResponse.success("Package created", packageService.createPackage(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<InsurancePackage>> updatePackage(@PathVariable Long id, @RequestBody InsurancePackage request) {
        return ResponseEntity.ok(ApiResponse.success("Package updated", packageService.updatePackage(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deletePackage(@PathVariable Long id) {
        packageService.deletePackage(id);
        return ResponseEntity.ok(ApiResponse.success("Package deleted", null));
    }
}
