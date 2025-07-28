package main.dto.response.notifications;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotifyResponse {
    private String username;
    private String profilePicture;
    private String text;
    private Long notificationId;
    private boolean isRead;
}
