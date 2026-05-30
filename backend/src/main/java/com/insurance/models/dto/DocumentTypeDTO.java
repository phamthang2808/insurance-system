package com.insurance.models.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentTypeDTO {
    private Long id;
    private String code;
    private String name;
    private String description;
    private Boolean active;
}
