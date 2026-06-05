package com.insurance.controllers;

import com.insurance.entities.Appointment;
import com.insurance.entities.UserEntity;
import com.insurance.models.dto.AppointmentDTO;
import com.insurance.repositories.AppointmentRepository;
import com.insurance.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    @PostMapping
    @Transactional
    public ResponseEntity<AppointmentDTO> createAppointment(@RequestBody AppointmentDTO dto) {
        UserEntity customer = userRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        Appointment appointment = new Appointment();
        appointment.setCustomer(customer);
        appointment.setScheduledTime(dto.getScheduledTime());
        appointment.setReason(dto.getReason());
        
        if (dto.getStaffId() != null) {
            UserEntity staff = userRepository.findById(dto.getStaffId()).orElse(null);
            appointment.setStaff(staff);
        }

        Appointment saved = appointmentRepository.save(appointment);
        return ResponseEntity.ok(convertToDTO(saved));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<AppointmentDTO>> getCustomerAppointments(@PathVariable Long customerId) {
        List<Appointment> apps = appointmentRepository.findByCustomerIdOrderByScheduledTimeDesc(customerId);
        return ResponseEntity.ok(apps.stream().map(this::convertToDTO).collect(Collectors.toList()));
    }

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<List<AppointmentDTO>> getStaffAppointments(@PathVariable Long staffId) {
        List<Appointment> apps = appointmentRepository.findByStaffIdOrderByScheduledTimeDesc(staffId);
        return ResponseEntity.ok(apps.stream().map(this::convertToDTO).collect(Collectors.toList()));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countAppointments(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long staffId) {
        if (customerId != null) {
            return ResponseEntity.ok(appointmentRepository.countByCustomerId(customerId));
        } else if (staffId != null) {
            return ResponseEntity.ok(appointmentRepository.countByStaffId(staffId));
        } else {
            return ResponseEntity.ok(appointmentRepository.count());
        }
    }

    @PutMapping("/{id}/status")
    @Transactional
    public ResponseEntity<AppointmentDTO> updateStatus(
            @PathVariable Long id, 
            @RequestParam String status,
            @RequestParam(required = false) String meetingLink) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(status);
        if (meetingLink != null) {
            appointment.setMeetingLink(meetingLink);
        }
        Appointment saved = appointmentRepository.save(appointment);
        return ResponseEntity.ok(convertToDTO(saved));
    }

    private AppointmentDTO convertToDTO(Appointment entity) {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(entity.getId());
        dto.setCustomerId(entity.getCustomer().getId());
        dto.setCustomerName(entity.getCustomer().getFullName());
        if (entity.getStaff() != null) {
            dto.setStaffId(entity.getStaff().getId());
            dto.setStaffName(entity.getStaff().getFullName());
        }
        dto.setScheduledTime(entity.getScheduledTime());
        dto.setStatus(entity.getStatus());
        dto.setReason(entity.getReason());
        dto.setMeetingLink(entity.getMeetingLink());
        return dto;
    }
}
