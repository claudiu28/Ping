package main.kafka.appevents;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendshipRequestEvent {
    private String senderName;
    private String receiverName;
    private String senderProfilePicture;
    private String receiverProfilePicture;
    private Long idFriendship;
}
