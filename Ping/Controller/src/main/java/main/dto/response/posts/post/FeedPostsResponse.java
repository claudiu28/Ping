package main.dto.response.posts.post;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FeedPostsResponse {
    private Long id;
    private String mediaUrl;
    private String contentType;
    private String description;
    private String profilePicture;
    private String username;
    private String message;
}
