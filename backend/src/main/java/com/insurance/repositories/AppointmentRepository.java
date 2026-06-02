package com.insurance.repositories;

import com.insurance.entities.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByCustomerIdOrderByScheduledTimeDesc(Long customerId);
    List<Appointment> findByStaffIdOrderByScheduledTimeDesc(Long staffId);
}
