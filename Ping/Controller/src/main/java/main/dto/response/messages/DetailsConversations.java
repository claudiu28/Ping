package main.dto.response.messages;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import main.users.User;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetailsConversations {
    private Long conversationId;
    private User sender;
    private Long id;
    private String text;
    private String messageResponse;
}
