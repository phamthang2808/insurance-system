package com.insurance.models.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {
    private long totalDocuments;
    private long pendingDocuments;
    private long completedDocuments;
    private long failedDocuments;
    private long totalCompanies;
    private long totalUsers;
    private double successRate;
}
