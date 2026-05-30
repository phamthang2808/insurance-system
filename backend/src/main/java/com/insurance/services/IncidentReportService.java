package com.insurance.services;

import com.insurance.entities.IncidentReport;
import com.insurance.entities.UserEntity;
import com.insurance.models.dto.IncidentReportDTO;
import com.insurance.repositories.IncidentReportRepository;
import com.insurance.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentReportService {

    private final IncidentReportRepository incidentRepository;
    private final UserRepository userRepository;

    public List<IncidentReportDTO> getAllIncidents() {
        return incidentRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<IncidentReportDTO> getIncidentsByCustomerId(Long customerId) {
        return incidentRepository.findByCustomerId(customerId).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public IncidentReportDTO createIncident(IncidentReportDTO request) {
        UserEntity customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        IncidentReport incident = new IncidentReport();
        incident.setCustomer(customer);
        incident.setDescription(request.getDescription());
        incident.setAttachments(request.getAttachments());
        incident.setStatus("PENDING");
        incident.setReportedAt(LocalDateTime.now());

        return mapToDTO(incidentRepository.save(incident));
    }

    @Transactional
    public IncidentReportDTO updateIncidentStatus(Long id, String status) {
        IncidentReport incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));
        incident.setStatus(status);
        return mapToDTO(incidentRepository.save(incident));
    }

    private IncidentReportDTO mapToDTO(IncidentReport incident) {
        IncidentReportDTO dto = new IncidentReportDTO();
        dto.setId(incident.getId());
        dto.setCustomerId(incident.getCustomer().getId());
        dto.setCustomerName(incident.getCustomer().getFullName());
        dto.setDescription(incident.getDescription());
        dto.setAttachments(incident.getAttachments());
        dto.setStatus(incident.getStatus());
        dto.setReportedAt(incident.getReportedAt());
        return dto;
    }
}
