package com.insurance.models.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GoogleAuthRequest {
    @NotBlank(message = "Token khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Size(max = 2000, message = "Token khĂ´ng Ä‘Æ°á»£c vÆ°á»£t quĂ¡ 2000 kĂ½ tá»±")
    private String token;
}
