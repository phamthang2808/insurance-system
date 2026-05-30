package com.insurance.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Entity
@Table(name = "consultation_notes")
@Data
@EqualsAndHashCode(callSuper = true)
public class ConsultationNote extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private UserEntity staff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private UserEntity customer;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String note;

    @Column(name = "noted_at")
    private LocalDateTime notedAt = LocalDateTime.now();
}
