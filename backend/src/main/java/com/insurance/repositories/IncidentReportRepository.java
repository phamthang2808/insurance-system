package com.insurance.repositories;

import com.insurance.entities.IncidentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IncidentReportRepository extends JpaRepository<IncidentReport, Long> {
    List<IncidentReport> findByCustomerId(Long customerId);
    long countByStatus(String status);
}
