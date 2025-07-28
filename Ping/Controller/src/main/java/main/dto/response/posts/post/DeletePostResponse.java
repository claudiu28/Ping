package main.dto.response.posts.post;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeletePostResponse {
    private Long id;
    private String mediaUrl;
    private String contentType;
    private String description;
    private String message;
}
