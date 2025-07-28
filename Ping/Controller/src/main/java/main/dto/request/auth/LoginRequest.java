package main.dto.request.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Username should not be blank")
    @Size(min = 5,message = "Username should have at least 5 characters")
    private String username;

    @NotBlank(message = "Password should not be blank")
    @Size(min = 8,message = "Password should have at least 8 characters")
    private String password;

    @NotBlank(message = "Verify password should not be blank")
    @Size(min = 8,message = "Verify password should have at least 8 characters")
    private String verifyPassword;

}