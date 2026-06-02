package com.insurance.controllers;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.insurance.entities.UserEntity;
import com.insurance.models.request.LoginRequest;
import com.insurance.models.response.ApiResponse;
import com.insurance.models.response.AuthResponse;
import com.insurance.models.response.UserResponse;
import com.insurance.services.AuditLogService;
import com.insurance.services.JwtService;
import com.insurance.services.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;
    private final AuditLogService auditLogService;

    /**
     * Login with email and password
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            log.info("Login attempt for email: {}", request.getEmail());

            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            UserEntity user = (UserEntity) authentication.getPrincipal();

            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            UserResponse userResponse = userService.getUserById(user.getId());

            // Ghi audit log đăng nhập thành công
            auditLogService.logAction(
                user.getId(),
                user.getEmail(),
                "login",
                "",
                "User logged in with email/password",
                "success"
            );

            AuthResponse authResponse = AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userResponse)
                .build();

            return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));

        } catch (BadCredentialsException e) {
            log.warn("Failed login attempt for email: {}", request.getEmail());

            // Ghi audit log đăng nhập thất bại
            auditLogService.logAction(
                null,
                request.getEmail(),
                "login",
                "",
                "Failed login attempt - bad credentials",
                "failed"
            );

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Email hoặc mật khẩu không đúng", HttpStatus.UNAUTHORIZED.value()));

        } catch (DisabledException e) {
            log.warn("Disabled account login attempt for email: {}", request.getEmail());

            auditLogService.logAction(
                null,
                request.getEmail(),
                "login",
                "",
                "Failed login attempt - account disabled",
                "failed"
            );

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Tài khoản của bạn đã bị vô hiệu hóa", HttpStatus.FORBIDDEN.value()));
        }
    }

    /**
     * Register new account
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, String>>> register() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
            .body(ApiResponse.error("Vui lòng đăng nhập bằng Google", HttpStatus.NOT_IMPLEMENTED.value()));
    }
}
