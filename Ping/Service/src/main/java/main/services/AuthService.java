package main.services;

import com.sun.jdi.request.DuplicateRequestException;
import jakarta.persistence.EntityExistsException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import main.interfaces.IAuthService;
import main.users.*;
import main.users.Enums.RoleType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService implements IAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ResetTokenRepository resetTokenRepository;
    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public User register(String username, String phone, String password) {
        log.info("Attempting to register user: '{}'", username);

        if (userRepository.findByUsername(username).isPresent()) {
            throw new DuplicateRequestException("User already exists");
        }
        Role userRole;
        try {
            userRole = roleRepository.findByName(RoleType.ROLE_USER).orElseThrow(() -> new RuntimeException("Role not found"));
        } catch (Exception ex) {
            userRole = roleRepository.save(Role.builder().name(RoleType.ROLE_USER).build());
        }
        String hashedPassword = passwordEncoder.encode(password);
        User newUser = User.builder().username(username).password(hashedPassword).phone(phone).build();
        newUser.addRole(userRole);
        User savedUser = userRepository.save(newUser);
        log.info("User '{}' registered successfully", username);
        return savedUser;
    }

    private String generateCode() {
        return String.valueOf(100000 + new Random().nextInt(900000));
    }

    public String sendCode(String phone) {
        User user = userRepository.findByPhone(phone).orElseThrow(() -> new EntityExistsException("Phone number not associated with any account"));

        String code = generateCode();
        ResetToken token = ResetToken.builder().user(user).code(code).expiresAt(LocalDateTime.now().plusMinutes(15)).verified(false).build();
        user.addToken(token);
        resetTokenRepository.save(token);

        log.info("Reset code sent to {}", phone);
        return code;
    }

    @Transactional
    public boolean verifyCode(String phone, String code) {
        User user = userRepository.findByPhone(phone).orElseThrow(() -> new EntityExistsException("Phone number not associated with any account"));

        ResetToken token = resetTokenRepository.findByCodeAndUser(user, code).orElseThrow(() -> new EntityExistsException("Invalid reset code"));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Reset code expired");
        }
        log.info("Marking token as verified (transactional)");
        token.setVerified(true);
        return true;
    }

    @Transactional
    public User resetPassword(String phone, String newPassword) {
        User user = userRepository.findByPhone(phone).orElseThrow(() -> new EntityExistsException("Phone number not associated with any account"));
        var passHash = passwordEncoder.encode(newPassword);
        user.setPassword(passHash);
        log.info("Password reset successful for user {}", user.getUsername());
        return user;
    }
}
