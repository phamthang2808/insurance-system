package com.insurance.controllers;

import com.insurance.entities.ChatMessage;
import com.insurance.entities.IncidentReport;
import com.insurance.entities.UserEntity;
import com.insurance.models.dto.ChatMessageDTO;
import com.insurance.repositories.ChatMessageRepository;
import com.insurance.repositories.IncidentReportRepository;
import com.insurance.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final IncidentReportRepository incidentReportRepository;

    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessageDTO chatMessageDTO) {
        UserEntity sender = userRepository.findById(chatMessageDTO.getSenderId()).orElse(null);
        UserEntity receiver = chatMessageDTO.getReceiverId() != null ? 
                              userRepository.findById(chatMessageDTO.getReceiverId()).orElse(null) : null;
        IncidentReport incident = chatMessageDTO.getIncidentId() != null ? 
                                  incidentReportRepository.findById(chatMessageDTO.getIncidentId()).orElse(null) : null;
        
        if (sender == null) return;

        ChatMessage message = new ChatMessage();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setIncident(incident);
        message.setContent(chatMessageDTO.getContent());
        
        ChatMessage savedMsg = chatMessageRepository.save(message);
        chatMessageDTO.setId(savedMsg.getId());
        chatMessageDTO.setTimestamp(savedMsg.getTimestamp());
        chatMessageDTO.setSenderName(sender.getFullName());

        if (receiver != null) {
            messagingTemplate.convertAndSendToUser(
                    receiver.getId().toString(),"/queue/messages",
                    chatMessageDTO
            );
        }
        
        if (incident != null) {
            messagingTemplate.convertAndSend("/topic/incident/" + incident.getId(), chatMessageDTO);
        }
    }

    @GetMapping("/api/chat/incident/{incidentId}")
    public ResponseEntity<List<ChatMessageDTO>> getChatHistoryForIncident(@PathVariable Long incidentId) {
        List<ChatMessage> messages = chatMessageRepository.findByIncidentIdOrderByTimestampAsc(incidentId);
        List<ChatMessageDTO> dtos = messages.stream().map(this::convertToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    private ChatMessageDTO convertToDTO(ChatMessage entity) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(entity.getId());
        dto.setSenderId(entity.getSender().getId());
        dto.setSenderName(entity.getSender().getFullName());
        if (entity.getReceiver() != null) {
            dto.setReceiverId(entity.getReceiver().getId());
        }
        if (entity.getIncident() != null) {
            dto.setIncidentId(entity.getIncident().getId());
        }
        dto.setContent(entity.getContent());
        dto.setRead(entity.isRead());
        dto.setTimestamp(entity.getTimestamp());
        return dto;
    }
}
