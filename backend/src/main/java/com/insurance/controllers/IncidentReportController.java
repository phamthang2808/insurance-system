package com.insurance.controllers;

import com.insurance.models.dto.IncidentReportDTO;
import com.insurance.models.response.ApiResponse;
import com.insurance.services.IncidentReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class IncidentReportController {

    private final IncidentReportService incidentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<List<IncidentReportDTO>>> getAllIncidents() {
        return ResponseEntity.ok(ApiResponse.success("Success", incidentService.getAllIncidents()));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF', 'USER')")
    public ResponseEntity<ApiResponse<List<IncidentReportDTO>>> getIncidentsByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(ApiResponse.success("Success", incidentService.getIncidentsByCustomerId(customerId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF', 'USER')")
    public ResponseEntity<ApiResponse<IncidentReportDTO>> createIncident(@RequestBody IncidentReportDTO request) {
        return ResponseEntity.ok(ApiResponse.success("Incident reported", incidentService.createIncident(request)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<IncidentReportDTO>> updateIncidentStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", incidentService.updateIncidentStatus(id, status)));
    }
}
