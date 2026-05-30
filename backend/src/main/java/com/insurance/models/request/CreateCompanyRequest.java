package com.insurance.models.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCompanyRequest {
    @NotBlank(message = "Code is required")
    private String code;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Phone is required")
    private String phone;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotBlank(message = "Address is required")
    private String address;
}
