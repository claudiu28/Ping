package main.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import main.dto.request.messages.CreateGroupRequest;
import main.dto.request.messages.SendMessageRequest;
import main.dto.response.messages.*;
import main.interfaces.IMessageService;
import main.messages.Conversation;
import main.messages.Message;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class MessagesController {

    private final IMessageService messagesService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @PostMapping("/user1/{username1}/user2/{username2}/private/{chatName}")
    public ResponseEntity<?> createChatPrivate(@PathVariable("username1") String username1, @PathVariable("username2") String username2, @PathVariable("chatName") String chatName) {
        log.info("Creating private chat between '{}' and '{}'", username1, username2);
        try {
            var chatPrivate = messagesService.createPrivateConversation(username1, username2);
            ChatPrivateResponse chat = ChatPrivateResponse.builder().id(chatPrivate.getId()).name(chatName).members(chatPrivate.getParticipants().stream().toList()).message("Private chat created with success").build();
            log.debug("Private conversation created: {}", chatPrivate.getId());
            return ResponseEntity.ok(chat);
        } catch (Exception ex) {
            log.error("Failed to create private chat: {}", ex.getMessage());
            return ResponseEntity.internalServerError().body(ChatPrivateResponse.builder().message(ex.getMessage()).build());
        }
    }

    @PostMapping("/group/{groupName}")
    public ResponseEntity<?> createChatGroup(@PathVariable("groupName") String groupName, @RequestBody CreateGroupRequest request) {
        log.info("Creating group chat '{}' with users: {}", groupName, request.getUsernames());
        try {
            var groupChat = messagesService.createGroupConversation(groupName, request.getUsernames());
            ChatGroupResponse chat = ChatGroupResponse.builder().nameGroup(groupName).id(groupChat.getId()).members(groupChat.getParticipants().stream().toList()).message("Created group chat").build();
            log.debug("Group conversation created: {}", groupChat.getId());
            return ResponseEntity.ok(chat);
        } catch (Exception ex) {
            log.error("Failed to create group chat '{}': {}", groupName, ex.getMessage());
            return ResponseEntity.internalServerError().body(ChatGroupResponse.builder().message(ex.getMessage()).build());
        }
    }

    @PostMapping("conversation/{id}")
    public ResponseEntity<?> sendMessage(@PathVariable("id") Long conversationId, @RequestParam("username") String username, @RequestBody SendMessageRequest request) {
        log.info("Sending message in conversation ID {} from user '{}'", conversationId, username);
        try {
            var message = messagesService.sendMessage(conversationId, username, request.getText());
            log.debug("Message sent with ID {}", message.getId());
            SendMessageResponse messageSend = SendMessageResponse.builder().user(message.getUser()).text(message.getText()).id(message.getId()).conversationId(conversationId).messageResponse("Message successfully created").build();

            ChatResponse payload = ChatResponse.builder()
                    .messageId(message.getId())
                    .conversationId(conversationId)
                    .text(message.getText())
                    .pictureProfile(message.getUser().getProfilePicture())
                    .username(message.getUser().getUsername())
                    .build();
            simpMessagingTemplate.convertAndSend("/topic/conversations/" + conversationId, payload);
            return ResponseEntity.ok(messageSend);
        } catch (Exception ex) {
            log.error("Failed to send message: {}", ex.getMessage());
            return ResponseEntity.internalServerError().body(SendMessageResponse.builder().messageResponse(ex.getMessage()).build());
        }
    }

    @DeleteMapping("/conversation/{id}")
    public ResponseEntity<Map<String, String>> deleteConversation(@PathVariable("id") Long conversationId) {
        log.info("Deleting conversation with ID {}", conversationId);
        try {
            messagesService.deleteConversation(conversationId);
            log.debug("Conversation {} deleted successfully", conversationId);
            return ResponseEntity.ok(Map.of("message", "Conversation deleted successfully"));
        } catch (Exception ex) {
            log.error("Failed to delete conversation {}: {}", conversationId, ex.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("message", "Conversation could not be deleted"));
        }
    }

    @GetMapping("/conversation/{id}/details")
    public ResponseEntity<?> allDetailsConversation(@PathVariable("id") Long conversationId) {
        log.info("Fetching messages for conversation ID {}", conversationId);
        try {
            List<Message> list = messagesService.getMessagesConversationId(conversationId);
            List<DetailsConversations> messagesDetails = list.stream()
                    .map(m -> DetailsConversations.builder()
                            .conversationId(conversationId)
                            .text(m.getText())
                            .sender(m.getUser())
                            .id(m.getId()).build()).toList();
            log.debug("Found {} messages", list.size());
            return ResponseEntity.ok(messagesDetails);
        } catch (Exception ex) {
            log.error("Failed to fetch messages: {}", ex.getMessage());
            return ResponseEntity.internalServerError().body(DetailsConversations.builder().messageResponse(ex.getMessage()).build());
        }
    }

    @GetMapping("/conversation/user")
    public ResponseEntity<?> allConversations(@RequestParam("username") String username) {
        log.info("Fetching all conversations for user '{}'", username);
        try {
            List<Conversation> list = messagesService.getConversationsByUser(username);
            List<AllConversations> conversations = list.stream().map(conversation -> AllConversations.builder()
                            .id(conversation.getId())
                            .name(conversation.getName())
                            .members(conversation.getParticipants().stream().toList()).
                            conversationType(conversation.getConversationType().toString()).build())
                    .toList();
            log.debug("Found {} conversations", list.size());
            return ResponseEntity.ok(conversations);
        } catch (Exception ex) {
            log.error("Failed to fetch conversations: {}", ex.getMessage());
            return ResponseEntity.internalServerError().body(AllConversations.builder().messageResponse(ex.getMessage()).build());
        }
    }
}
