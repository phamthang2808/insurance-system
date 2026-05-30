package com.insurance.controllers;

import com.insurance.models.response.ApiResponse;
import com.insurance.services.ConsultationNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ConsultationNoteController {

    private final ConsultationNoteService noteService;

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getNotesByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(ApiResponse.success("Success", noteService.getNotesByCustomer(customerId)));
    }

    @GetMapping("/staff/{staffId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getNotesByStaff(@PathVariable Long staffId) {
        return ResponseEntity.ok(ApiResponse.success("Success", noteService.getNotesByStaff(staffId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createNote(@RequestBody Map<String, Object> request) {
        Long staffId = Long.valueOf(request.get("staffId").toString());
        Long customerId = Long.valueOf(request.get("customerId").toString());
        String note = request.get("note").toString();
        return ResponseEntity.ok(ApiResponse.success("Note created", noteService.createNote(staffId, customerId, note)));
    }
}
