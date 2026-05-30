package com.insurance.models.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentDTO {
    private Long id;
    private Long companyId;
    private String companyName;
    private Long documentTypeId;
    private String documentTypeName;
    private Long userId;
    private String userEmail;
    private String fileName;
    private String fileUrl;
    private Long fileSize;
    private String fileType;
    private String status;
    private LocalDateTime uploadedAt;
    private LocalDateTime processedAt;
    private String errorMessage;
}
