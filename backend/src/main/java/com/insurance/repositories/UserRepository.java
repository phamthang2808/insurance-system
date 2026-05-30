package com.insurance.repositories;


import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.insurance.entities.UserEntity;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    //    Optional<UserEntity> findByUsername(String username);
    Optional<UserEntity> findByEmail(String email);
    Boolean existsByEmail(String email);
    Optional<UserEntity> findByGoogleId(String googleId);
//    Optional<UserEntity> findByFacebookId(String facebookId);

    // Spring Data JPA sáº½ tá»± Ä‘á»™ng táº¡o cĂ¢u SQL: SELECT * FROM users WHERE email LIKE %search% OR full_name LIKE %search% LIMIT ... OFFSET ...
    Page<UserEntity> findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(
            String email, String fullName, Pageable pageable);

    // TĂ¬m kiáº¿m theo fullName hoáº·c email
    Page<UserEntity> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String fullName, String email, Pageable pageable);

    // Lá»c theo vai trĂ²
    Page<UserEntity> findByRoleId(Long roleId, Pageable pageable);

    // Lá»c theo tráº¡ng thĂ¡i active/inactive
    Page<UserEntity> findByIsActive(Boolean isActive, Pageable pageable);

    // Äáº¿m users Ä‘Æ°á»£c táº¡o trong khoáº£ng thá»i gian
    @Query("SELECT COUNT(u) FROM UserEntity u WHERE u.createdAt BETWEEN :startDate AND :endDate")
    Long countByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Äáº¿m users hoáº¡t Ä‘á»™ng
    long countByIsActiveTrue();
}
