package com.insurance.repositories;

import com.insurance.entities.ConsultationNote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConsultationNoteRepository extends JpaRepository<ConsultationNote, Long> {
    List<ConsultationNote> findByCustomerIdOrderByNotedAtDesc(Long customerId);
    List<ConsultationNote> findByStaffIdOrderByNotedAtDesc(Long staffId);
}
