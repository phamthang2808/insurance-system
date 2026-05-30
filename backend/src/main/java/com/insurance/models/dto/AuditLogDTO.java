package com.insurance.models.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogDTO {
    private Long id;
    private Long userId;
    private String userEmail;
    private String action; // login, upload, view, download, delete, etc.
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
    private String ipAddress;
    private String details; // JSON string of additional details
    private String status; // success, failed
    private String errorMessage;
}
