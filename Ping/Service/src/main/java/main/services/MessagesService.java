package main.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import main.interfaces.IMessageService;
import main.messages.Conversation;
import main.messages.ConversationRepository;
import main.messages.Enums.ConversationType;
import main.messages.Message;
import main.messages.MessagesRepository;
import main.users.User;
import main.users.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessagesService implements IMessageService {

    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final MessagesRepository messagesRepository;

    public Conversation createPrivateConversation(String username1, String username2) {
        log.debug("Attempting to create private conversation between '{}' and '{}'", username1, username2);

        var user1 = userRepository.findByUsername(username1).orElseThrow(() -> {
            log.error("First user '{}' not found", username1);
            return new IllegalArgumentException("User not found: " + username1);
        });
        var user2 = userRepository.findByUsername(username2).orElseThrow(() -> {
            log.error("Second user'{}' not found", username2);
            return new IllegalArgumentException("User not found: " + username2);
        });
        if (user1.equals(user2)) {
            throw new IllegalArgumentException("Cannot create a private conversation with yourself.");
        }
        var conversation = Conversation.builder().conversationType(ConversationType.PRIVATE).participants(Set.of(user1, user2)).build();
        conversation.addParticipant(user1);
        conversation.addParticipant(user2);
        var saved = conversationRepository.save(conversation);
        log.info("Created PRIVATE conversation with ID {} between '{}' and '{}'", saved.getId(), username1, username2);
        return saved;
    }

    public Conversation createGroupConversation(String groupName, List<String> usernames) {
        log.debug("Creating group conversation '{}' with users: {}", groupName, usernames);

        Set<User> users = new HashSet<>();
        usernames.forEach(name -> {
            userRepository.findByUsername(name).ifPresentOrElse(users::add, () -> log.warn("User '{}' not found, skipping", name));
        });

        var conversation = Conversation.builder().name(groupName).conversationType(ConversationType.GROUP).participants(users).build();
        users.forEach(conversation::addParticipant);

        var saved = conversationRepository.save(conversation);
        log.info("Created GROUP conversation '{}' with ID {} and {} participants", groupName, saved.getId(), users.size());
        return saved;
    }

    public void deleteConversation(Long conversationId) {
        log.debug("Attempting to delete conversation with ID {}", conversationId);

        if (!conversationRepository.existsById(conversationId)) {
            log.error("Conversation {} not found with ID", conversationId);
            throw new EntityNotFoundException("Conversation not found");
        }

        var conversation = conversationRepository.findById(conversationId).orElseThrow(() -> new EntityNotFoundException("Not found conversations"));

        Set<User> copy = new HashSet<>(conversation.getParticipants());
        for (User user : copy) {
            conversation.removeParticipant(user);
        }

        conversationRepository.deleteById(conversationId);
        log.info("Deleted conversation with ID {}", conversationId);
    }

    public Message sendMessage(Long conversationId, String senderUsername, String content) {
        log.debug("Sending message in conversation ID {} from user '{}'", conversationId, senderUsername);

        var conversation = conversationRepository.findById(conversationId).orElseThrow(() -> {
            log.error("Conversation not found");
            return new IllegalArgumentException("Conversation not found");
        });

        var sender = userRepository.findByUsername(senderUsername).orElseThrow(() -> {
            log.error("Sender '{}' not found", senderUsername);
            return new IllegalArgumentException("User not found");
        });

        if (!conversation.getParticipants().contains(sender)) {
            log.error("Sender is no part of conversation member");
            throw new IllegalArgumentException("Sender not found");
        }

        var message = Message.builder().conversation(conversation).user(sender).text(content).build();
        conversation.addMessage(message);
        sender.addMessage(message);

        var saved = messagesRepository.save(message);
        log.info("Message sent by '{}' in conversation ID {} (message ID: {})", senderUsername, conversationId, saved.getId());
        return saved;
    }

    public void deleteMessage(Long messageId) {
        log.debug("Attempting to delete message with ID {}", messageId);

        if (!messagesRepository.existsById(messageId)) {
            log.error("Message with ID {} not found", messageId);
            throw new EntityNotFoundException("Message not found");
        }

        var message = messagesRepository.findById(messageId).orElseThrow(() -> new EntityNotFoundException("Message not found"));

        message.getConversation().removeMessage(message);
        message.getUser().removeMessage(message);

        messagesRepository.deleteById(messageId);

        log.info("Deleted message with ID {}", messageId);
    }

    public List<Conversation> getConversationsByUser(String username) {
        log.debug("Fetching conversations for user '{}'", username);

        var user = userRepository.findByUsername(username).orElseThrow(() -> {
            log.error("User '{}' not found", username);
            return new IllegalArgumentException("User not found");
        });
        var result = conversationRepository.findConversationsByUser(user);
        log.info("Found {} conversations for user '{}'", result.size(), username);
        return result;
    }

    public List<Message> getMessagesConversationId(Long conversationId) {
        log.debug("Fetching messages for conversation ID {}", conversationId);

        var conversation = conversationRepository.findById(conversationId).orElseThrow(() -> {
            log.error("Conversation with ID {} not found", conversationId);
            return new IllegalArgumentException("Conversation not found");
        });

        var result = messagesRepository.findByConversation(conversation);
        log.info("Found {} messages in conversation ID {}", result.size(), conversationId);
        return result;
    }
}
