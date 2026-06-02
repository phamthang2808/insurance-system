package com.insurance.repositories;

import com.insurance.entities.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByIncidentIdOrderByTimestampAsc(Long incidentId);
    List<ChatMessage> findBySenderIdOrReceiverIdOrderByTimestampAsc(Long senderId, Long receiverId);
}
