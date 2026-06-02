package com.insurance.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@EqualsAndHashCode(callSuper = true)
public class ChatMessage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private UserEntity sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = true)
    private UserEntity receiver; // Can be null if it's a broadcast or AI?

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id", nullable = true)
    private IncidentReport incident; // If the chat is linked to a specific incident

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private boolean isRead = false;

    @Column(updatable = false)
    private LocalDateTime timestamp = LocalDateTime.now();
}
