package com.insurance.controllers;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.insurance.components.LocalizationUtils;
import com.insurance.models.request.GoogleAuthRequest;
import com.insurance.models.response.ApiResponse;
import com.insurance.models.response.AuthResponse;
import com.insurance.models.response.UserResponse;
import com.insurance.services.UserService;
import com.insurance.utils.MessageKeys;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final LocalizationUtils localizationUtils;


    @PostMapping("/google-login")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(@Valid @RequestBody GoogleAuthRequest request) {
        AuthResponse authData = userService.googleLogin(request.getToken());
        String message = localizationUtils.getLocalizedMessage(MessageKeys.GOOGLE_LOGIN_SUCCESS);
        ApiResponse<AuthResponse> response = ApiResponse.success(message, authData);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody com.insurance.models.request.LoginRequest request) {
        AuthResponse authData = userService.login(request);
        ApiResponse<AuthResponse> response = ApiResponse.success("ÄÄƒng nháº­p thĂ nh cĂ´ng", authData);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile() {
        UserResponse user = userService.getProfie();
        String message = localizationUtils.getLocalizedMessage(MessageKeys.SUCCESS);
        return ResponseEntity.ok(ApiResponse.success(message, user));
    }

    @GetMapping("/id/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable Long userId) {
        UserResponse user = userService.getUserById(userId);
        String message = localizationUtils.getLocalizedMessage(MessageKeys.SUCCESS);
        return ResponseEntity.ok(ApiResponse.success(message, user));
    }


}
