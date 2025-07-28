package main.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import main.kafka.appevents.CommentAddEvent;
import main.kafka.appevents.FriendshipRequestEvent;
import main.kafka.appevents.PostAddEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaProducer {
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendPostCreated(PostAddEvent event){
        log.info("Sending post event: {}", event);
        kafkaTemplate.send("post-add-event", event);
    }

    public void sendFriendRequest(FriendshipRequestEvent event){
        log.info("Sending friend request event {}", event);
        kafkaTemplate.send("friend-request-event", event);
    }

    public void sendCommentCreated(CommentAddEvent event){
        log.info("Comment request event {}", event);
        kafkaTemplate.send("comment-event", event);
    }

}
