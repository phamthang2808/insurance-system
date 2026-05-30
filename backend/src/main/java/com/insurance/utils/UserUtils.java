package com.insurance.utils;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.insurance.services.CustomUserDetailsService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UserUtils {

    private final CustomUserDetailsService userDetailsService;

    /**
     * Get current user ID from SecurityContext (JWT token)
     */
    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("User is not authenticated");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) principal;
            String email = userDetails.getUsername(); // Username is email
            // Get userId from database using email
            return userDetailsService.getUserIdByEmail(email);
        }

        throw new IllegalArgumentException("Unable to extract user ID from authentication");
    }

    /**
     * Get current user email from SecurityContext
     */
    public String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("User is not authenticated");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) principal;
            return userDetails.getUsername();
        }

        throw new IllegalArgumentException("Unable to extract user email from authentication");
    }
}
