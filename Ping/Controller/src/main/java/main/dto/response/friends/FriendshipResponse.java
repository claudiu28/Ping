package main.dto.response.friends;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendshipResponse {
    public String message;
    public Long id;
    public String senderUsername;
    public String receiverUsername;
    public String senderProfileImage;
    public String receiverProfileImage;
}
