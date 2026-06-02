package com.insurance.models.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentDTO {
    private Long id;
    private Long customerId;
    private String customerName;
    private Long staffId;
    private String staffName;
    private LocalDateTime scheduledTime;
    private String status;
    private String reason;
    private String meetingLink;
}
