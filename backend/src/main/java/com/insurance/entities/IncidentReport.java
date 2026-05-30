package com.insurance.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Entity
@Table(name = "incident_reports")
@Data
@EqualsAndHashCode(callSuper = true)
public class IncidentReport extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private UserEntity customer;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;
    
    private String attachments;
    private String status;

    @Column(updatable = false)
    private LocalDateTime reportedAt = LocalDateTime.now();
}
