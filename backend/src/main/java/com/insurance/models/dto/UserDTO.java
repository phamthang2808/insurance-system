package com.insurance.models.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String email;
    private String name;
    private String photoUrl;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private Boolean active;
}
