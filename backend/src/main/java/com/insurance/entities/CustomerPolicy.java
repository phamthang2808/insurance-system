package com.insurance.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;

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
    private String status;

    // Tài chính
    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "amount_paid")
    private Double amountPaid;

    // Quy trình duyệt: RECEIVING -> APPRAISING -> SIGNING -> ACTIVE
    @Column(name = "process_step")
    private String processStep;
}
