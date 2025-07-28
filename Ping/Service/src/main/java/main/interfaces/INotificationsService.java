package main.interfaces;

import main.notification.Notification;

import java.util.List;

public interface INotificationsService {
    Notification addNotification(String username, String message);

    void deleteNotification(Long id);

    List<Notification> getUnRead(String username);

    List<Notification> getAll(String username);

    Notification markAsRead(Long notificationId);
}
