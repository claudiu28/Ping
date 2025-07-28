package main.dto.response.posts.comment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllCommentsResponse {
    private Long id;
    private String text;
    private String username;
    private String profilePicture;
    private String message;
}
