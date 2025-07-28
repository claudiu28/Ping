package main.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import main.interfaces.IFriendsService;
import main.interfaces.INotificationsService;
import main.kafka.appevents.CommentAddEvent;
import main.kafka.appevents.FriendshipRequestEvent;
import main.kafka.appevents.PostAddEvent;
import main.kafka.appdto.NotifyResponse;
import main.notification.Notification;
import main.users.User;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaConsumer {

    private final INotificationsService notificationsService;
    private final IFriendsService friendsService;
    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = "post-add-event", groupId = "ping-group", containerFactory = "kafkaListenerContainerFactory")
    public void handlePostCreated(PostAddEvent event) {
        log.info("Received post event: {}", event);
        var acceptedFriends = friendsService.getAllAcceptedFriendships(event.getSender());
        acceptedFriends.forEach(f -> {
            User receiver;

            if (f.getSender().getUsername().equals(event.getSender())) {
                receiver = f.getReceiver();
            } else {
                receiver = f.getSender();
            }

            Notification notification = notificationsService.addNotification(receiver.getUsername(), "New post arrived from:" + event.getSender());

            var response = NotifyResponse.builder().username(event.getSender())
                    .profilePicture(event.getSenderPicture())
                    .text(notification.getText())
                    .notificationId(notification.getId())
                    .isRead(notification.isRead())
                    .type("POST")
                    .build();

            log.info("Sending to, post: /topic/notifications/{}", receiver.getUsername());
            messagingTemplate.convertAndSend("/topic/notifications/" + receiver.getUsername(), response);
        });
    }

    @KafkaListener(topics = "friend-request-event", groupId = "ping-group", containerFactory = "kafkaListenerContainerFactory")
    public void handleFriendRequest(FriendshipRequestEvent event) {
        log.info("Received friend request event: {}", event);

        Notification notification = notificationsService.addNotification(event.getReceiverName(), "New friend request from: " + event.getSenderName());
        var response = NotifyResponse.builder().username(event.getSenderName())
                .profilePicture(event.getSenderProfilePicture())
                .text(notification.getText())
                .notificationId(notification.getId())
                .isRead(notification.isRead())
                .type("FRIEND_REQUEST")
                .build();

        log.info("Sending to, friend-request: /topic/notifications/{}", event.getReceiverName());
        messagingTemplate.convertAndSend("/topic/notifications/" + event.getReceiverName(), response);
    }

    @KafkaListener(topics = "comment-event", groupId = "ping-group", containerFactory = "kafkaListenerContainerFactory")
    public void handleCommentCreated(CommentAddEvent event) {
        log.info("Received comment event: {}", event);

        Notification notification = notificationsService.addNotification(event.getReceiverUsername(), "New comment arrived from:" + event.getSenderUsername());

        var response = NotifyResponse.builder().username(event.getSenderUsername())
                .profilePicture(event.getSenderProfilePicture())
                .text(notification.getText())
                .notificationId(notification.getId())
                .isRead(notification.isRead())
                .type("COMMENT")
                .build();

        log.info("Sending to, comment: /topic/notifications/{}", event.getReceiverUsername());
        messagingTemplate.convertAndSend("/topic/notifications/" + event.getReceiverUsername(), response);
    }

}

