package com.insurance.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.insurance.entities.AuditLogEntity;
import com.insurance.models.dto.AuditLogDTO;
import com.insurance.repositories.AuditLogRepository;
import com.insurance.utils.UserUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ModelMapper modelMapper;
    private final UserUtils userUtils;

    /**
     * Log current admin's action automatically
     */
    public void logCurrentAdminAction(String action, String details) {
        try {
            Long userId = userUtils.getCurrentUserId();
            String email = userUtils.getCurrentUserEmail();
            logAction(userId, email, action, "", details, "success");
        } catch (Exception e) {
            log.error("Error creating audit log for current admin action", e);
        }
    }

    /**
     * Log user action to audit log
     */
    public void logAction(Long userId, String userEmail, String action, String ipAddress, String details, String status) {
        try {
            AuditLogEntity auditLog = AuditLogEntity.builder()
                    .userId(userId)  // cĂ³ thá»ƒ null khi login tháº¥t báº¡i
                    .userEmail(userEmail != null ? userEmail : "unknown")
                    .action(action)
                    .ipAddress(ipAddress)
                    .details(details)
                    .status(status)
                    .timestamp(LocalDateTime.now())
                    .build();
            
            auditLogRepository.save(auditLog);
            log.info("Audit log created: {} - {}", userEmail, action);
        } catch (Exception e) {
            log.error("Error creating audit log", e);
        }
    }

    /**
     * Get all audit logs with pagination
     */
    public Page<AuditLogDTO> getAllAuditLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        return auditLogRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    /**
     * Get audit logs for specific user
     */
    public List<AuditLogDTO> getUserAuditLogs(Long userId) {
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get audit logs for date range
     */
    public List<AuditLogDTO> getAuditLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return auditLogRepository.findByTimestampBetweenOrderByTimestampDesc(startDate, endDate)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert entity to DTO
     */
    private AuditLogDTO convertToDTO(AuditLogEntity entity) {
        return modelMapper.map(entity, AuditLogDTO.class);
    }
}
