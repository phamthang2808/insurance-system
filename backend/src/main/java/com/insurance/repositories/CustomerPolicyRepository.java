package com.insurance.repositories;

import com.insurance.entities.CustomerPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CustomerPolicyRepository extends JpaRepository<CustomerPolicy, Long> {
    List<CustomerPolicy> findByCustomerId(Long customerId);
    long countByStatus(String status);
}
