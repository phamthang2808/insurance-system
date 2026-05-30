package com.insurance.services;

import com.insurance.entities.CustomerPolicy;
import com.insurance.entities.InsurancePackage;
import com.insurance.entities.UserEntity;
import com.insurance.models.dto.CustomerPolicyDTO;
import com.insurance.repositories.CustomerPolicyRepository;
import com.insurance.repositories.InsurancePackageRepository;
import com.insurance.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerPolicyService {

    private final CustomerPolicyRepository policyRepository;
    private final UserRepository userRepository;
    private final InsurancePackageRepository packageRepository;

    public List<CustomerPolicyDTO> getAllPolicies() {
        return policyRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<CustomerPolicyDTO> getPoliciesByCustomerId(Long customerId) {
        return policyRepository.findByCustomerId(customerId).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public CustomerPolicyDTO createPolicy(CustomerPolicyDTO request) {
        UserEntity customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        InsurancePackage pkg = packageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new RuntimeException("Package not found"));

        CustomerPolicy policy = new CustomerPolicy();
        policy.setCustomer(customer);
        policy.setInsurancePackage(pkg);
        policy.setStartDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now());
        policy.setEndDate(request.getEndDate() != null ? request.getEndDate() : LocalDate.now().plusYears(1));
        policy.setStatus("PENDING");
        policy.setProcessStep("RECEIVING");
        policy.setTotalAmount(pkg.getPrice() != null ? pkg.getPrice() : 0.0);
        policy.setAmountPaid(request.getAmountPaid() != null ? request.getAmountPaid() : 0.0);

        return mapToDTO(policyRepository.save(policy));
    }

    @Transactional
    public CustomerPolicyDTO updatePolicyStatus(Long id, String status) {
        CustomerPolicy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found"));
        policy.setStatus(status);
        return mapToDTO(policyRepository.save(policy));
    }

    @Transactional
    public CustomerPolicyDTO advanceProcessStep(Long id) {
        CustomerPolicy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        String currentStep = policy.getProcessStep();
        switch (currentStep != null ? currentStep : "RECEIVING") {
            case "RECEIVING":
                policy.setProcessStep("APPRAISING");
                break;
            case "APPRAISING":
                policy.setProcessStep("SIGNING");
                break;
            case "SIGNING":
                policy.setProcessStep("COMPLETED");
                policy.setStatus("ACTIVE");
                break;
            default:
                break;
        }
        return mapToDTO(policyRepository.save(policy));
    }

    @Transactional
    public CustomerPolicyDTO makePayment(Long id, Double amount) {
        CustomerPolicy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found"));
        double currentPaid = policy.getAmountPaid() != null ? policy.getAmountPaid() : 0.0;
        policy.setAmountPaid(currentPaid + amount);
        return mapToDTO(policyRepository.save(policy));
    }

    private CustomerPolicyDTO mapToDTO(CustomerPolicy policy) {
        CustomerPolicyDTO dto = new CustomerPolicyDTO();
        dto.setId(policy.getId());
        dto.setCustomerId(policy.getCustomer().getId());
        dto.setCustomerName(policy.getCustomer().getFullName());
        dto.setPackageId(policy.getInsurancePackage().getId());
        dto.setPackageName(policy.getInsurancePackage().getName());
        dto.setStartDate(policy.getStartDate());
        dto.setEndDate(policy.getEndDate());
        dto.setStatus(policy.getStatus());
        dto.setTotalAmount(policy.getTotalAmount());
        dto.setAmountPaid(policy.getAmountPaid());
        dto.setProcessStep(policy.getProcessStep());
        return dto;
    }
}
