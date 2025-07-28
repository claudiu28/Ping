package main.dto.response.auth;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeResponse {
    private Long id;
    private String username;
    private String lastName;
    private String firstName;
    private String phone;
    private String bio;
    private String profilePicture;
    private String[] roles;
}
