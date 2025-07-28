package main.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import main.dto.response.friends.FriendshipResponse;
import main.friends.Enums.FriendshipRequestType;
import main.friends.Friendship;
import main.interfaces.IFriendsService;
import main.kafka.KafkaProducer;
import main.kafka.appevents.FriendshipRequestEvent;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@Slf4j
@RestController
@RequestMapping("/api/friends")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
@RequiredArgsConstructor
public class FriendsController {

    private final IFriendsService friendsService;
    private final KafkaProducer kafkaProducer;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @PostMapping("/send")
    public ResponseEntity<FriendshipResponse> send(@RequestParam("sender") String sender, @RequestParam("receiver") String receiver) {
        log.info("Attempting to send friendship request from '{}' to '{}'", sender, receiver);
        try {
            Friendship friendship = friendsService.sendRequest(sender, receiver);

            var payload = FriendshipRequestEvent.builder().idFriendship(friendship.getId())
                    .receiverName(friendship.getReceiver().getUsername())
                    .senderName(friendship.getSender().getUsername())
                    .senderProfilePicture(friendship.getSender().getProfilePicture())
                    .receiverProfilePicture(friendship.getReceiver().getProfilePicture())
                    .build();

            kafkaProducer.sendFriendRequest(payload);

            simpMessagingTemplate.convertAndSend("/topic/friends/" + friendship.getReceiver().getUsername(), payload);

            log.info("Friendship request successfully created from '{}' to '{}'", sender, receiver);
            return ResponseEntity.ok(FriendshipResponse.builder()
                    .id(friendship.getId())
                    .receiverUsername(friendship.getReceiver().getUsername())
                    .receiverProfileImage(friendship.getReceiver().getProfilePicture())
                    .senderUsername(friendship.getSender().getUsername())
                    .senderProfileImage(friendship.getSender().getProfilePicture())
                    .message("Friendship add with success").build());
        } catch (Exception ex) {
            log.error("Failed to register friendship from '{}' to '{}': {}", sender, receiver, ex.getMessage());
            return ResponseEntity.internalServerError().body(FriendshipResponse.builder().message(ex.getMessage()).build());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<FriendshipResponse> deleteFriendship(@PathVariable("id") Long id) {
        log.info("Attempting to delete friendship with id '{}'", id);
        try {
            friendsService.deleteFriendship(id);
            log.info("Friendship deleted successfully");
            return ResponseEntity.ok(FriendshipResponse.builder().id(id).message("Friendship deleted with success").build());
        } catch (Exception ex) {
            log.error("Failed to deleted friendship with id '{}', error: '{}'", id, ex.getMessage());
            return ResponseEntity.internalServerError().body(FriendshipResponse.builder().message(ex.getMessage()).build());
        }
    }


    @PostMapping("/response/{id}")
    public ResponseEntity<FriendshipResponse> respondToRequest(@PathVariable("id") Long id, @RequestParam("type") String requestType) {
        log.info("Attempting to respond to friendship request #{} with status '{}'", id, requestType);
        try {
            Friendship respondTo;
            if (Objects.equals(requestType, FriendshipRequestType.Accepted.toString())) {
                respondTo = friendsService.respondRequest(id, FriendshipRequestType.Accepted);
            } else {
                respondTo = friendsService.respondRequest(id, FriendshipRequestType.Rejected);
            }
            if (respondTo.getFriendshipRequestType() == FriendshipRequestType.Rejected) {
                friendsService.deleteFriendship(respondTo.getId());
                return ResponseEntity.ok(FriendshipResponse.builder().message("Friendship rejected").build());
            }
            log.info("Successfully updated friendship #{} to '{}'", id, requestType);
            return ResponseEntity.ok(FriendshipResponse.builder()
                    .id(respondTo.getId())
                    .receiverUsername(respondTo.getReceiver().getUsername())
                    .receiverProfileImage(respondTo.getReceiver().getProfilePicture())
                    .senderUsername(respondTo.getSender().getUsername())
                    .senderProfileImage(respondTo.getSender().getProfilePicture())
                    .message("Friendship add with success").build());
        } catch (Exception ex) {
            log.error("Failed to respond to friendship #{}: {}", id, ex.getMessage());
            return ResponseEntity.internalServerError().body(FriendshipResponse.builder().message(ex.getMessage()).build());
        }
    }

    @GetMapping("/{username}/pending")
    public ResponseEntity<?> allPending(@PathVariable("username") String username) {
        log.info("Fetching all pending friendship requests for '{}'", username);
        try {
            List<Friendship> pending = friendsService.getAllPendingFriendships(username);
            List<FriendshipResponse> listPending = pending.stream().map(f -> FriendshipResponse.builder()
                    .id(f.getId())
                    .receiverUsername(f.getReceiver().getUsername())
                    .receiverProfileImage(f.getReceiver().getProfilePicture())
                    .senderUsername(f.getSender().getUsername())
                    .senderProfileImage(f.getSender().getProfilePicture()).build()).toList();
            log.info("Found {} pending friendships for '{}'", listPending.size(), username);
            return ResponseEntity.ok(listPending);
        } catch (Exception ex) {
            log.error("Error fetching pending friendships for '{}': {}", username, ex.getMessage());
            return ResponseEntity.internalServerError().body(FriendshipResponse.builder().message(ex.getMessage()).build());
        }
    }


    @GetMapping("/{username}/accept")
    public ResponseEntity<?> allAccept(@PathVariable("username") String username) {
        log.info("Fetching all accepted friendships for '{}'", username);
        try {
            List<Friendship> accepted = friendsService.getAllAcceptedFriendships(username);
            List<FriendshipResponse> listPending = accepted.stream().map(f -> FriendshipResponse.builder()
                    .id(f.getId())
                    .receiverUsername(f.getReceiver().getUsername())
                    .receiverProfileImage(f.getReceiver().getProfilePicture())
                    .senderUsername(f.getSender().getUsername())
                    .senderProfileImage(f.getSender().getProfilePicture()).build()).toList();
            log.info("Found {} accepted friendships for '{}'", accepted.size(), username);
            return ResponseEntity.ok(listPending);
        } catch (Exception ex) {
            log.error("Error fetching accepted friendships for '{}': {}", username, ex.getMessage());
            return ResponseEntity.internalServerError().body(FriendshipResponse.builder().message(ex.getMessage()).build());
        }
    }

    @GetMapping("/{username}/suggested")
    public ResponseEntity<?> suggestedFriends(@PathVariable("username") String username) {
        try {
            log.info("Fetching suggested friends for user '{}'", username);
            var suggested = friendsService.getSuggestedFriends(username);
            log.info("Found {} suggested friends for user '{}'", suggested.size(), username);
            return ResponseEntity.ok(suggested);
        } catch (Exception ex) {
            log.error("Error suggesting friends for user '{}': {}", username, ex.getMessage());
            return ResponseEntity.internalServerError().body(FriendshipResponse.builder().message(ex.getMessage()).build());
        }
    }
}
