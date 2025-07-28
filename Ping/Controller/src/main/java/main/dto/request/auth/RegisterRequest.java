package main.dto.request.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Username should not be blank")
    @Size(min = 5,message = "Username should have at least 5 characters")
    private String username;

    @NotBlank(message = "Phone should not be blank")
    @Size(min = 9,message = "Phone should have at least 10 characters")
    private String phone;

    @NotBlank(message = "Password should not be blank")
    @Size(min = 8,message = "Password should have at least 8 characters")
    private String password;

    @NotBlank(message = "Verify password should not be blank")
    @Size(min = 8,message = "Verify password should have at least 8 characters")
    private String confirmPassword;
}
