package com.insurance.entities;


import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;

@Entity
@Table(name = "users")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity extends BaseEntity implements UserDetails {

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false)
    private String fullName;
//
//    @Column(name ="address")
//    private String address;

    @Column(length = 500)
    private String avatarUrl;

//    @Column(length = 20)
//    private String phone;
//
//    @Column(length = 500)
//    private String bio = "";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private RoleEntity role;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "google_id")
    private String googleId;
//
//    @Column(name = "facebook_id")
//    private String facebookId;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isGoogleLinked = false;
//
//    @Column(nullable = false)
//    @Builder.Default
//    private Boolean isFacebookLinked = false;
//
//    @Column(nullable = false)
//    private Boolean isEmailVerified;

    // ======================== RELATIONSHIPS ========================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_staff_id")
    private UserEntity assignedStaff;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private java.util.List<CustomerPolicy> policies = new ArrayList<>();

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private java.util.List<IncidentReport> incidentReports = new ArrayList<>();

    // ==================================================================================

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
        if (role != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName().toUpperCase()));
        }
        return authorities;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return isActive;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }



    @Override
    public boolean isEnabled() {
        return isActive;
    }
}
