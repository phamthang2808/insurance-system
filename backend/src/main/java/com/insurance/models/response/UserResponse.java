package com.insurance.models.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    @NotNull(message = "ID khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private Long id;

    @NotBlank(message = "Email khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Email(message = "Email khĂ´ng há»£p lá»‡")
    private String email;

    @NotBlank(message = "TĂªn khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Size(min = 2, max = 100, message = "TĂªn pháº£i tá»« 2 Ä‘áº¿n 100 kĂ½ tá»±")
    private String fullName;

    @Size(max = 500, message = "URL áº£nh khĂ´ng Ä‘Æ°á»£c vÆ°á»£t quĂ¡ 500 kĂ½ tá»±")
    private String avatarUrl;

    @Size(max = 50, message = "Vai trĂ² khĂ´ng Ä‘Æ°á»£c vÆ°á»£t quĂ¡ 50 kĂ½ tá»±")
    private String role;

    private Boolean isActive;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @Size(max = 500, message = "Google ID khĂ´ng Ä‘Æ°á»£c vÆ°á»£t quĂ¡ 500 kĂ½ tá»±")
    private String googleId;

    private Boolean isGoogleLinked;

    private AssignedStaffInfo assignedStaff;
}



