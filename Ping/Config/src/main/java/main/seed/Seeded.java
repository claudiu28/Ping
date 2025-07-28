package main.seed;

import lombok.RequiredArgsConstructor;
import main.users.Enums.RoleType;
import main.users.Role;
import main.users.RoleRepository;
import main.users.User;
import main.users.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class Seeded implements CommandLineRunner {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        Role adminRole = roleRepository.findByName(RoleType.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(Role.builder().name(RoleType.ROLE_ADMIN).build()));

        Role userRole = roleRepository.findByName(RoleType.ROLE_USER).orElseGet(() -> roleRepository.save(Role.builder().name(RoleType.ROLE_USER).build()));

        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();

            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setPhone("123456789");
            admin.addRole(adminRole);

            userRepository.save(admin);
            System.out.println("Admin user created.");
        } else {
            System.out.println("Admin user already exists.");
        }

        if (userRepository.findByUsername("alexandru").isEmpty()) {
            User alex = new User();

            alex.setUsername("alexandru");
            alex.setPassword(passwordEncoder.encode("alexandru123"));
            alex.setPhone("999999999");
            alex.addRole(adminRole);
            alex.addRole(userRole);

            userRepository.save(alex);
            System.out.println("Alexandru user created.");
        } else {
            System.out.println("Alexandru user already exists.");
        }
    }
}
