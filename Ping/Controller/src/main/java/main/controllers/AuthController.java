package main.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import main.dto.request.auth.*;
import main.dto.response.auth.*;
import main.interfaces.IAuthService;
import main.interfaces.IUserService;
import main.jwt.CustomUserDetails;
import main.jwt.JwtService;
import main.sms.SmsSend;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@Slf4j
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final IAuthService authService;
    private final SmsSend smsSend;
    private final PasswordEncoder passwordEncoder;
    private final IUserService userService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            if (!request.getConfirmPassword().equals(request.getPassword())) {
                throw new Exception("Password not matched");
            }
            log.info("Registering user: '{}'", request.getUsername());
            var userRegistered = authService.register(request.getUsername(), request.getPhone(), request.getPassword());
            return ResponseEntity.ok(RegisterResponse.builder().id(userRegistered.getId()).username(userRegistered.getUsername()).phone(userRegistered.getPhone()).message("User saved with success").build());
        } catch (Exception ex) {
            log.error("Error while registering user: {}", ex.getMessage());
            return ResponseEntity.internalServerError().body(RegisterResponse.builder().message(ex.getMessage()).build());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            log.info("Authenticating user: '{}'", request.getUsername());
            var username = request.getUsername();
            var password = request.getPassword();
            var verifyPassword = request.getVerifyPassword();

            if (!password.equals(verifyPassword)) {
                return ResponseEntity.badRequest().body(LoginResponse.builder().message("Password does not match").build());
            }
            System.out.println(username);
            System.out.println(password);
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );
            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            String token = jwtService.generateToken(userDetails);
            return ResponseEntity.ok(LoginResponse.builder().id(userDetails.getId()).username(userDetails.getUsername()).token(token).message("Login successful").build());
        } catch (Exception e) {
            log.error("Error during login: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(LoginResponse.builder().message(e.getMessage()).build());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        try {
            var phone = forgotPasswordRequest.getPhone();
            var code = authService.sendCode(phone);
            smsSend.sendSms(phone, "Code is:" + code);
            return ResponseEntity.ok(ForgotPasswordResponse.builder().code(code).phone(phone).message("Reset code sent via SMS").build());
        } catch (Exception e) {
            log.error("Error during forgot-password: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(ForgotPasswordResponse.builder().message(e.getMessage()).build());
        }
    }

    @PostMapping("/verify-code")
    public ResponseEntity<Map<String, String>> verifyCode(@RequestParam("phone") String phone, @RequestBody VerifyCode request) {
        try {
            if (request.getCode().length() != 6) {
                throw new Exception("Code is invalid");
            }
            boolean isVerified = authService.verifyCode(phone, request.code);
            if (!isVerified) {
                throw new Exception("Verified failed");
            }
            return ResponseEntity.ok(Map.of("message", "Verification successfully proceed"));
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body(Map.of("message", "Verification failed"));
        }
    }

    @PatchMapping("/reset-password")
    public ResponseEntity<ResetPasswordResponse> resetPassword(@RequestParam("phone") String phone, @RequestBody ResetPasswordRequest request) {
        try {
            if (!request.getNewPassword().equals(request.getVerifyPassword())) {
                throw new Exception("Passwords do not match");
            }
            if (request.getNewPassword().length() < 8) {
                throw new Exception("Password is too short");
            }
            var user = authService.resetPassword(phone, request.getNewPassword());
            if (!passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
                throw new Exception("Password could not be modified");
            }
            return ResponseEntity.ok(ResetPasswordResponse.builder().username(user.getUsername()).message("Password successfully reset").build());
        } catch (Exception e) {
            return ResponseEntity.ok(ResetPasswordResponse.builder().message(e.getMessage()).build());
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<Void> verifyToken() {
        return ResponseEntity.ok().build();
    }


    @GetMapping("/me")
    public ResponseEntity<?> takeInformationMe(@RequestParam("token") String token) {
        log.info("Received request for user info from token");
        try {
            var username = jwtService.extractUsername(token);
            log.info("Extracted username from token: {}", username);
            var user = userService.findByUsername(username)
                    .orElseThrow(() -> new Exception("User not found for username: " + username));
            log.info("Fetched user: {} {}", user.getFirstName(), user.getLastName());
            String[] roles = user.getRoles().stream().map(role -> role.getName().name()).toArray(String[]::new);
            log.debug("User roles: {}", (Object) roles);
            var meResponse = new MeResponse(user.getId(), user.getUsername(), user.getLastName(), user.getFirstName(), user.getPhone(), user.getBio(), user.getProfilePicture(), roles);
            log.info("Returning user profile for '{}'", user.getUsername());
            return ResponseEntity.ok(meResponse);
        } catch (Exception ex) {
            log.error("Error while processing /me request: {}", ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body("Error: " + ex.getMessage());
        }
    }

}
