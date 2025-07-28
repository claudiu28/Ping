package main.dto.response.messages;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private Long messageId;
    private Long conversationId;
    private String username;
    private String pictureProfile;
    private String text;
}
