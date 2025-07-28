package main.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminResponse {
    private String username;
    private String lastName;
    private String firstName;
    private String phone;
    private String bio;
    private String profilePicture;
    private String[] roles;
}
