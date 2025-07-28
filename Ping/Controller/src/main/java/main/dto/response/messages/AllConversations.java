package main.dto.response.messages;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import main.users.User;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllConversations {
    private Long id;
    private String name;
    private String conversationType;
    private List<User> members;
    private String messageResponse;
}
