package com.insurance.services;


import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.insurance.components.LocalizationUtils;
import com.insurance.entities.RoleEntity;
import com.insurance.entities.UserEntity;
import com.insurance.exceptions.DataNotFoundException;
import com.insurance.exceptions.InvalidParamException;
import com.insurance.models.request.CreateUserRequest;
import com.insurance.models.response.AuthResponse;
import com.insurance.models.response.AssignedStaffInfo;
import com.insurance.models.response.UserResponse;
import com.insurance.repositories.RoleRepository;
import com.insurance.repositories.UserRepository;
import com.insurance.utils.MessageKeys;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor


public class UserService {

    private final UserRepository userRepository;
    private final LocalizationUtils localizationUtils;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RoleRepository roleRepository;
    private final ModelMapper modelMapper;
    private final AuditLogService auditLogService;

    @Value("${google.oauth2.client-id}")
    private String googleClientId;

    @Value("${google.oauth2.client-secret}")
    private String googleClientSecret;


    /**
     * Láº¥y profile cá»§a chĂ­nh mĂ¬nh
     */
    public UserResponse getProfie() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserEntity user = (UserEntity) authentication.getPrincipal();
        return mapToUserResponse(user);
    }

    /**
     * Láº¥y info public cá»§a má»™t user khĂ¡c
     */
    public UserResponse getUserById(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    String message = localizationUtils.getLocalizedMessage(MessageKeys.DATA_NOT_FOUND);
                    return new InvalidParamException(message);
                });
        return mapToUserResponse(user);
    }

    /**
     * Láº¥y user theo email
     */
    public UserResponse getUserByEmail(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    String message = localizationUtils.getLocalizedMessage(MessageKeys.DATA_NOT_FOUND);
                    return new com.insurance.exceptions.InvalidParamException(message);
                });
        return mapToUserResponse(user);
    }


    @Transactional
    public AuthResponse googleLogin(String credentialToken) {
        try {
            // 1. Khá»Ÿi táº¡o "mĂ¡y quĂ©t" Token chĂ­nh chá»§ cá»§a Google
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            // 2. XĂ¡c minh cĂ¡i token mĂ  React vá»«a gá»­i lĂªn
            GoogleIdToken idToken = verifier.verify(credentialToken);
            if (idToken == null) {
                throw new InvalidParamException("Token Google khĂ´ng há»£p lá»‡ hoáº·c Ä‘Ă£ háº¿t háº¡n.");
            }

            // 3. Giáº£i mĂ£ láº¥y thĂ´ng tin User ngay táº¡i chá»— (KhĂ´ng cáº§n gá»i thĂªm API sang Google)
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");
            String googleId = payload.getSubject();

            // 4. Xá»¬ LĂ LOGIC DATABASE (TĂ¡i sá»­ dá»¥ng logic xuáº¥t sáº¯c cá»§a báº¡n)
            Optional<UserEntity> userByGoogleId = userRepository.findByGoogleId(googleId); // Nhá»› táº¡o hĂ m nĂ y trong Repository nhĂ©
            UserEntity user;

            if (userByGoogleId.isPresent()) {
                // Ká»CH Báº¢N 1: ÄĂ£ tá»«ng Ä‘Äƒng nháº­p Google rá»“i -> Cá»© tháº¿ mĂ  vĂ o
                user = userByGoogleId.get();

                // TĂ­nh nÄƒng xá»‹n: Náº¿u há» Ä‘á»•i email trĂªn Google, há»‡ thá»‘ng mĂ¬nh tá»± cáº­p nháº­t theo luĂ´n
                if (!user.getEmail().equals(email)) {
                    user.setEmail(email);
                    userRepository.save(user);
                }

            } else {
                // Táº§ng 2: KhĂ´ng tĂ¬m tháº¥y googleId. QuĂ©t xem email nĂ y Ä‘Ă£ Ä‘Äƒng kĂ½ thÆ°á»ng (báº±ng máº­t kháº©u) bao giá» chÆ°a?
                Optional<UserEntity> userByEmail = userRepository.findByEmail(email);

                if (userByEmail.isPresent()) {
                    // Ká»CH Báº¢N 2: Tháº¥y email cÅ© -> Gá»™p tĂ i khoáº£n (Merge Account)
                    user = userByEmail.get();
                    linkGoogleAccount(user, googleId);
                } else {
                    // Ká»CH Báº¢N 3: KhĂ´ng tĂ¬m tháº¥y cáº£ GoogleId láº«n Email -> NgÆ°á»i dĂ¹ng hoĂ n toĂ n má»›i
                    user = createGoogleUser(email, name, pictureUrl, googleId);
                }
            }

// Chá»‘t cháº·n an ninh: Kiá»ƒm tra xem tĂ i khoáº£n (dĂ¹ cÅ© hay má»›i) cĂ³ Ä‘ang bá»‹ Admin khĂ³a khĂ´ng
            if (user.getIsActive() != null && !user.getIsActive()) {
                throw new InvalidParamException("TĂ i khoáº£n cá»§a báº¡n Ä‘Ă£ bá»‹ khĂ³a.");
            }


            // 5. Cáº¥p 2 cĂ¡i tháº» quen thuá»™c cá»§a KLTN_Travel
            String token = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            // Ghi nháº­t kĂ½ truy cáº­p (Audit Log) vĂ o MongoDB
            auditLogService.logAction(
                    user.getId(),
                    user.getEmail(),
                    "login_google",
                    "",
                    "User logged in via Google OAuth",
                    "success"
            );

            return AuthResponse.builder()
                    .accessToken(token)
                    .refreshToken(refreshToken)
                    .user(mapToUserResponse(user))
                    .build();

        } catch (InvalidParamException e) {
            throw e; // Tráº£ Ä‘Ăºng lá»—i do mĂ¬nh tá»± Ä‘á»‹nh nghÄ©a ra Controller
        } catch (Exception e) {
            throw new RuntimeException("XĂ¡c thá»±c Google OAuth tháº¥t báº¡i: " + e.getMessage());
        }
    }

    @Transactional
    public AuthResponse login(com.insurance.models.request.LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserEntity user = (UserEntity) authentication.getPrincipal();

            if (user.getIsActive() != null && !user.getIsActive()) {
                throw new InvalidParamException("TĂ i khoáº£n cá»§a báº¡n Ä‘Ă£ bá»‹ khĂ³a");
            }

            String token = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            // Ghi nháº­t kĂ½ truy cáº­p (Audit Log) vĂ o MongoDB
            auditLogService.logAction(
                    user.getId(),
                    user.getEmail(),
                    "login_local",
                    "",
                    "User logged in via Email/Password",
                    "success"
            );

            return AuthResponse.builder()
                    .accessToken(token)
                    .refreshToken(refreshToken)
                    .user(mapToUserResponse(user))
                    .build();
        } catch (org.springframework.security.core.AuthenticationException e) {
            throw new InvalidParamException("Email hoáº·c máº­t kháº©u khĂ´ng chĂ­nh xĂ¡c");
        }
    }



    @Transactional
    protected UserEntity createGoogleUser(String email, String name, String pictureUrl, String gooogleId) {
        RoleEntity userRole = roleRepository.findByNameIgnoreCase("USER")
                .orElseThrow(() -> new DataNotFoundException("Role USER khĂ´ng tá»“n táº¡i"));

        UserEntity user = UserEntity.builder()
                .email(email)
                // Sinh bá»«a má»™t cĂ¡i máº­t kháº©u mĂ£ hĂ³a vĂ¬ user Google khĂ´ng dĂ¹ng máº­t kháº©u nĂ y
                .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                .fullName(name != null ? name : email.split("@")[0])
                .avatarUrl(pictureUrl)
                .role(userRole) // Nhá»› má»Ÿ comment trÆ°á»ng nĂ y ra nhĂ© Ä‘á»ƒ phĂ¢n quyá»n
//                .isEmailVerified(false) // Google Ä‘Ă£ xĂ¡c thá»±c thĂ¬ mĂ¬nh tin luĂ´n
                .isActive(true)
                .isGoogleLinked(true)
                .googleId(gooogleId)
//                .facebookId("0")
                .build();

        return userRepository.save(user);
    }

    private void linkGoogleAccount(UserEntity user, String googleId) {
        // Náº¿u tĂ i khoáº£n cÅ© chÆ°a link vá»›i Google, thĂ¬ bĂ¢y giá» link láº¡i
        if (user.getIsGoogleLinked() == null || !user.getIsGoogleLinked()) {
            user.setIsGoogleLinked(true);
            user.setGoogleId(googleId);
            userRepository.save(user); // LÆ°u cáº­p nháº­t xuá»‘ng Database
        }
    }

    private UserResponse mapToUserResponse(UserEntity user) {
        UserResponse response = modelMapper.map(user, UserResponse.class);
        // Custom mapping for role (only set the role name)
        response.setRole(user.getRole() != null ? user.getRole().getName() : null);
        // Handle boolean fields
        response.setIsGoogleLinked(user.getIsGoogleLinked() != null ? user.getIsGoogleLinked() : false);
        // Map assignedStaff
        if (user.getAssignedStaff() != null) {
            UserEntity staff = user.getAssignedStaff();
            response.setAssignedStaff(AssignedStaffInfo.builder()
                    .id(staff.getId())
                    .fullName(staff.getFullName())
                    .email(staff.getEmail())
                    .build());
        } else {
            response.setAssignedStaff(null);
        }
        return response;
    }

    public UserRepository getUserRepository() {
        return userRepository;
    }

    /**
     * Get all users (Admin)
     */
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Create new user (Admin)
     */
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new InvalidParamException("Email already exists");
        }

        RoleEntity role = request.getRoleId() != null
                ? roleRepository.findById(request.getRoleId())
                        .orElseThrow(() -> new DataNotFoundException("Role not found"))
                : roleRepository.findByNameIgnoreCase("USER")
                        .orElseThrow(() -> new DataNotFoundException("Role USER not found"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserEntity currentUser = (UserEntity) authentication.getPrincipal();

        if (role != null && "SUPER_ADMIN".equalsIgnoreCase(role.getName()) && 
            (currentUser.getRole() == null || !"SUPER_ADMIN".equalsIgnoreCase(currentUser.getRole().getName()))) {
            throw new InvalidParamException("Chá»‰ Super Admin má»›i cĂ³ quyá»n táº¡o tĂ i khoáº£n Super Admin.");
        }

        UserEntity user = UserEntity.builder()
                .email(request.getEmail())
                .fullName(request.getFullName())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .isActive(true)
                .isGoogleLinked(false)
                .build();

        UserEntity savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    /**
     * Update user role (Admin)
     */
    @Transactional
    public UserResponse updateUserRole(Long userId, Long roleId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new DataNotFoundException("User not found"));

        checkAdminPermission(user);

        RoleEntity role = roleRepository.findById(roleId)
                .orElseThrow(() -> new DataNotFoundException("Role not found"));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserEntity currentUser = (UserEntity) authentication.getPrincipal();

        if (role != null && "SUPER_ADMIN".equalsIgnoreCase(role.getName()) && 
            (currentUser.getRole() == null || !"SUPER_ADMIN".equalsIgnoreCase(currentUser.getRole().getName()))) {
            throw new InvalidParamException("Chá»‰ Super Admin má»›i cĂ³ quyá»n cáº¥p phĂ¡t chá»©c vá»¥ Super Admin.");
        }

        user.setRole(role);
        UserEntity updated = userRepository.save(user);
        return mapToUserResponse(updated);
    }

    /**
     * Update user status (Admin)
     */
    @Transactional
    public UserResponse updateUserStatus(Long userId, Boolean isActive) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new DataNotFoundException("User not found"));

        checkAdminPermission(user);

        user.setIsActive(isActive);
        UserEntity updated = userRepository.save(user);
        return mapToUserResponse(updated);
    }

    /**
     * Reset user password (Admin)
     */
    @Transactional
    public void resetUserPassword(Long userId, String newPassword) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new DataNotFoundException("User not found"));

        checkAdminPermission(user);

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * Delete user (Admin - soft delete)
     */
    @Transactional
    public void deleteUser(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new DataNotFoundException("User not found"));

        checkAdminPermission(user);

        user.setIsActive(false);
        userRepository.save(user);
    }

    private void checkAdminPermission(UserEntity targetUser) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserEntity currentUser = (UserEntity) authentication.getPrincipal();

        // 1. KhĂ´ng ai Ä‘Æ°á»£c phĂ©p cháº¡m vĂ o Super Admin
        if (targetUser.getRole() != null && "SUPER_ADMIN".equalsIgnoreCase(targetUser.getRole().getName())) {
            throw new InvalidParamException("KhĂ´ng thá»ƒ thao tĂ¡c trĂªn tĂ i khoáº£n Super Admin.");
        }

        // 2. Admin khĂ´ng Ä‘Æ°á»£c thao tĂ¡c trĂªn Admin khĂ¡c
        if (currentUser.getRole() != null && "ADMIN".equalsIgnoreCase(currentUser.getRole().getName()) && 
            targetUser.getRole() != null && "ADMIN".equalsIgnoreCase(targetUser.getRole().getName())) {
            throw new InvalidParamException("Admin ngang hĂ ng khĂ´ng thá»ƒ thao tĂ¡c trĂªn tĂ i khoáº£n cá»§a nhau.");
        }
    }

    /**
     * Assign staff to customer (Admin)
     */
    @Transactional
    public UserResponse assignStaffToCustomer(Long customerId, Long staffId) {
        UserEntity customer = userRepository.findById(customerId)
                .orElseThrow(() -> new DataNotFoundException("Customer not found"));
        UserEntity staff = userRepository.findById(staffId)
                .orElseThrow(() -> new DataNotFoundException("Staff not found"));

        if (!"STAFF".equalsIgnoreCase(staff.getRole().getName())) {
            throw new InvalidParamException("Target user is not a STAFF");
        }

        customer.setAssignedStaff(staff);
        UserEntity updated = userRepository.save(customer);
        return mapToUserResponse(updated);
    }

    /**
     * Get customers assigned to a staff
     */
    public List<UserResponse> getAssignedCustomers(Long staffId) {
        return userRepository.findAll().stream()
                .filter(u -> u.getAssignedStaff() != null && u.getAssignedStaff().getId().equals(staffId))
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }
}
