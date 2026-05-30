package com.insurance.entities;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String userEmail;

    private String action;

    private LocalDateTime timestamp;

    private String ipAddress;

    @Column(columnDefinition = "TEXT")
    private String details;

    private String status;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;
}
