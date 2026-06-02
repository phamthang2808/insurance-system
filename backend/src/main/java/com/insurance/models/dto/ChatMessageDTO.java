package com.insurance.models.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChatMessageDTO {
    private Long id;
    private Long senderId;
    private String senderName;
    private Long receiverId;
    private Long incidentId;
    private String content;
    private boolean isRead;
    private LocalDateTime timestamp;
}
