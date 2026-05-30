package com.insurance.repositories;

import com.insurance.entities.InsurancePackage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InsurancePackageRepository extends JpaRepository<InsurancePackage, Long> {
}
