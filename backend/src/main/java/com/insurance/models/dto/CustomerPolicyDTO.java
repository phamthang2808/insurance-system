package com.insurance.models.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class CustomerPolicyDTO {
    private Long id;
    private Long customerId;
    private String customerName;
    private Long packageId;
    private String packageName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Double totalAmount;
    private Double amountPaid;
    private String processStep;
}
