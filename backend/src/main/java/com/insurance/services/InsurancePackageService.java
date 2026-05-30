package com.insurance.services;

import com.insurance.entities.InsurancePackage;
import com.insurance.repositories.InsurancePackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InsurancePackageService {

    private final InsurancePackageRepository packageRepository;

    public List<InsurancePackage> getAllPackages() {
        return packageRepository.findAll();
    }

    public InsurancePackage getPackageById(Long id) {
        return packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found with id: " + id));
    }

    @Transactional
    public InsurancePackage createPackage(InsurancePackage insurancePackage) {
        return packageRepository.save(insurancePackage);
    }

    @Transactional
    public InsurancePackage updatePackage(Long id, InsurancePackage updatedPackage) {
        InsurancePackage existing = getPackageById(id);
        existing.setName(updatedPackage.getName());
        existing.setDescription(updatedPackage.getDescription());
        existing.setTerms(updatedPackage.getTerms());
        existing.setPrice(updatedPackage.getPrice());
        existing.setStatus(updatedPackage.getStatus());
        return packageRepository.save(existing);
    }

    @Transactional
    public void deletePackage(Long id) {
        packageRepository.deleteById(id);
    }
}
