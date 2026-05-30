package com.insurance.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.insurance.entities.AuditLogEntity;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLogEntity, Long> {
    List<AuditLogEntity> findByUserId(Long userId);

    List<AuditLogEntity> findByUserIdOrderByTimestampDesc(Long userId);

    List<AuditLogEntity> findByUserIdAndTimestampBetween(Long userId, LocalDateTime start, LocalDateTime end);

    List<AuditLogEntity> findByAction(String action);

    List<AuditLogEntity> findByTimestampBetween(LocalDateTime start, LocalDateTime end);

    List<AuditLogEntity> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime start, LocalDateTime end);
}
