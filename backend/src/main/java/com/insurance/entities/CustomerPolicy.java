package com.insurance.entities;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "customer_policies")
@Data
@EqualsAndHashCode(callSuper = true)
public class CustomerPolicy extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private UserEntity customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    private InsurancePackage insurancePackage;

    private LocalDate startDate;
    private LocalDate endDate;
    
    @Column(name = "status", nullable = false, columnDefinition = "VARCHAR(50) DEFAULT 'PENDING'")
    private String status = "PENDING";

    // Tài chính
    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "amount_paid")
    private Double amountPaid;

    // Quy trình duyệt: RECEIVING -> APPRAISING -> SIGNING -> ACTIVE
    @Column(name = "process_step", nullable = false, columnDefinition = "VARCHAR(50) DEFAULT 'RECEIVING'")
    private String processStep = "RECEIVING";
}
