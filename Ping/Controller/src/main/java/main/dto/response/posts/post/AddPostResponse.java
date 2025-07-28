package main.dto.response.posts.post;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddPostResponse {
    private Long id;
    private String mediaUrl;
    private String contentType;
    private String description;
    private String profilePicture;
    private String username;
    private String message;
}
