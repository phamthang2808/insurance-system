package com.insurance.services;

import com.insurance.entities.ConsultationNote;
import com.insurance.entities.UserEntity;
import com.insurance.repositories.ConsultationNoteRepository;
import com.insurance.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConsultationNoteService {

    private final ConsultationNoteRepository noteRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getNotesByCustomer(Long customerId) {
        return noteRepository.findByCustomerIdOrderByNotedAtDesc(customerId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getNotesByStaff(Long staffId) {
        return noteRepository.findByStaffIdOrderByNotedAtDesc(staffId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> createNote(Long staffId, Long customerId, String noteText) {
        UserEntity staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        UserEntity customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        ConsultationNote note = new ConsultationNote();
        note.setStaff(staff);
        note.setCustomer(customer);
        note.setNote(noteText);
        note.setNotedAt(LocalDateTime.now());

        return mapToDTO(noteRepository.save(note));
    }

    private Map<String, Object> mapToDTO(ConsultationNote note) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", note.getId());
        dto.put("staffId", note.getStaff().getId());
        dto.put("staffName", note.getStaff().getFullName());
        dto.put("customerId", note.getCustomer().getId());
        dto.put("customerName", note.getCustomer().getFullName());
        dto.put("note", note.getNote());
        dto.put("notedAt", note.getNotedAt());
        return dto;
    }
}
