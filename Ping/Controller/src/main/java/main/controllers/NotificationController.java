package main.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import main.dto.request.notifications.NotifyRequest;
import main.dto.response.notifications.NotifyResponse;
import main.interfaces.INotificationsService;
import main.notification.Notification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notification")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class NotificationController {

    private final INotificationsService notificationsService;

    @GetMapping("/unread")
    public ResponseEntity<?> unread(@RequestParam("username") String username) {
        log.info("Getting unread notifications for '{}'", username);
        try {
            List<Notification> notifications = notificationsService.getUnRead(username);
            List<NotifyResponse> response = notifications.stream().map(n -> NotifyResponse.builder()
                    .username(n.getUser().getUsername())
                    .profilePicture(n.getUser().getProfilePicture())
                    .text(n.getText())
                    .notificationId(n.getId())
                    .isRead(n.isRead()).build()).toList();
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Error fetching unread notifications for '{}': {}", username, ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body("Error: " + ex.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> allNotifications(@RequestParam("username") String username) {
        log.info("Getting all notifications for '{}'", username);
        try {
            List<Notification> notifications = notificationsService.getAll(username);
            List<NotifyResponse> response = notifications.stream().map(n -> NotifyResponse.builder()
                    .username(n.getUser().getUsername())
                    .profilePicture(n.getUser().getProfilePicture())
                    .text(n.getText())
                    .notificationId(n.getId())
                    .isRead(n.isRead()).build()).toList();
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Error fetching all notifications for '{}': {}", username, ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body("Error: " + ex.getMessage());
        }
    }

    @PatchMapping("/mark-as-read")
    public ResponseEntity<?> markAsRead(@RequestParam("notificationId") Long notificationId) {
        log.info("Marking notification ID {} as read", notificationId);
        try {
            Notification notification = notificationsService.markAsRead(notificationId);
            return ResponseEntity.ok(NotifyResponse.builder()
                    .username(notification.getUser().getUsername())
                    .profilePicture(notification.getUser().getProfilePicture())
                    .text(notification.getText())
                    .notificationId(notification.getId())
                    .isRead(notification.isRead()).build());
        } catch (Exception ex) {
            log.error("Error marking notification ID {} as read: {}", notificationId, ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body("Error: " + ex.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable("id") Long id) {
        log.info("Deleting notification with ID {}", id);
        try {
            notificationsService.deleteNotification(id);
            log.info("Notification with ID {} deleted successfully", id);
            return ResponseEntity.ok(NotifyResponse.builder().notificationId(id).build());
        } catch (Exception ex) {
            log.error("Error deleting notification ID {}: {}", id, ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body("Error: " + ex.getMessage());
        }
    }
}
