package main.services;

import jakarta.persistence.EntityExistsException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import main.interfaces.INotificationsService;
import main.notification.Notification;
import main.notification.NotificationRepository;
import main.users.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationsService implements INotificationsService {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    public Notification addNotification(String username, String message) {
        log.info("Adding notification for user '{}': {}", username, message);

        var user = userRepository.findByUsername(username).orElseThrow(() -> {
            log.warn("User '{}' not found while adding notification", username);
            return new EntityExistsException("User not found");
        });

        var newNotification = Notification.builder().user(user).text(message).isRead(false).build();

        user.addNotify(newNotification);
        var saved = notificationRepository.save(newNotification);
        log.info("Notification added for user '{}', ID: {}", username, saved.getId());
        return saved;
    }

    public void deleteNotification(Long id) {
        log.info("Deleting notification with ID {}", id);
        var notification = notificationRepository.findById(id).orElseThrow(() -> {
            log.warn("Notification  not found with ID {}", id);
            return new EntityExistsException("Notification not found");
        });
        notification.getUser().removeNotify(notification);
        notificationRepository.deleteById(id);
        log.info("Notification with ID {} deleted successfully", id);
    }

    public List<Notification> getUnRead(String username) {
        log.info("Fetching unread notifications for user '{}'", username);
        var user = userRepository.findByUsername(username).orElseThrow(() -> {
            log.warn("User '{}' not found while fetching unread notifications", username);
            return new EntityExistsException("User not found");
        });
        var unread = notificationRepository.findNotReadNotifications(user);
        log.info("Found {} unread notifications for user '{}'", unread.size(), username);
        return unread;
    }

    public List<Notification> getAll(String username) {
        log.info("Fetching all notifications for user '{}'", username);

        var user = userRepository.findByUsername(username).orElseThrow(() -> {
            log.warn("User '{}' not found while fetching all notifications", username);
            return new EntityExistsException("User not found");
        });
        var all = notificationRepository.findByUser(user);
        log.info("Found {} total notifications for user '{}'", all.size(), username);
        return all;
    }

    @Transactional
    public Notification markAsRead(Long notificationId) {
        log.info("Marking notification ID {} as read", notificationId);
        var notification = notificationRepository.findById(notificationId).orElseThrow(() ->
        {
            log.warn("Notification with ID {} not found", notificationId);
            return new EntityExistsException("Notification not found");
        });

        notification.setRead(true);
        log.info("Notification ID {} marked as read", notificationId);
        return notification;
    }
}
