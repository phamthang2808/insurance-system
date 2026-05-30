package com.insurance.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "insurance_packages")
@Data
@EqualsAndHashCode(callSuper = true)
public class InsurancePackage extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String terms;

    private Double price;
    private String status;

    // Quy trình duyệt hồ sơ, phân tách bằng dấu phẩy: "Tiếp nhận,Thẩm định,Ký hợp đồng"
    @Column(name = "process_steps", columnDefinition = "TEXT")
    private String processSteps;
}
