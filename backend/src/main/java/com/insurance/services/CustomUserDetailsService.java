package com.insurance.services;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.insurance.entities.UserEntity;
import com.insurance.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("KhĂ´ng tĂ¬m tháº¥y ngÆ°á»i dĂ¹ng vá»›i email: " + email));
        return user;
    }

    /**
     * Get user ID by email
     */
    public Long getUserIdByEmail(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("KhĂ´ng tĂ¬m tháº¥y ngÆ°á»i dĂ¹ng vá»›i email: " + email));
        return user.getId();
    }
}


