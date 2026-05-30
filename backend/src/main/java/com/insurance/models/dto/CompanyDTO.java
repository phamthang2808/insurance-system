package com.insurance.models.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyDTO {
    private Long id;
    private String code;
    private String name;
    private String phone;
    private String email;
    private String address;
    private Boolean active;
}
