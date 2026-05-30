package com.insurance.models.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class IncidentReportDTO {
    private Long id;
    private Long customerId;
    private String customerName;
    private String description;
    private String attachments;
    private String status;
    private LocalDateTime reportedAt;
}
