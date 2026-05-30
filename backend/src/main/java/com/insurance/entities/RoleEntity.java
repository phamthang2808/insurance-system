package com.insurance.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleEntity extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String name; // ADMIN, STAFF, USER

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    private Boolean isActive = true;

    // Relationships
    @JsonIgnore
    @OneToMany(mappedBy = "role")
    private Set<UserEntity> users = new HashSet<>();
}

