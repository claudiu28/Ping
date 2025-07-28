package main.kafka.appevents;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostAddEvent {
    private String sender;
    private String senderPicture;
    private String mediaType;
    private String mediaUrl;
    private String description;
}
