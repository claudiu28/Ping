package main.kafka.appevents;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentAddEvent {
    private String receiverUsername;
    private String receiverProfilePicture;
    private String senderUsername;
    private String senderProfilePicture;
    private String text;
    private Long commentId;
}
