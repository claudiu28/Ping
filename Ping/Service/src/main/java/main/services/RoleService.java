package main.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import main.interfaces.IRoleService;
import main.users.Enums.RoleType;
import main.users.Role;
import main.users.RoleRepository;
import main.users.User;
import main.users.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Slf4j
@Service
@RequiredArgsConstructor
public class RoleService implements IRoleService {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    public Role createRole(RoleType name) {
        if (roleRepository.findByName(name).isPresent()) {
            log.warn("Attempted to create a role that already exists: {}", name);
            throw new IllegalArgumentException("Role already exists");
        }
        Role role = Role.builder().name(name).build();
        log.info("Created role {}", name);
        return roleRepository.save(role);
    }

    public void deleteRole(RoleType name) {
        Role role = roleRepository.findByName(name).orElseThrow(() -> {
            log.warn("Attempted to delete a role that does not exist: {}", name);
            return new EntityNotFoundException("Role not found");
        });
        roleRepository.delete(role);
        log.info("Deleted role {}", name);
    }

    @Transactional
    public User assignRoleToUser(String username, RoleType roleName) {
        log.info("Attempting to assign role {} to user {}", roleName, username);
        var user = userRepository.findByUsername(username).orElseThrow(() -> {
            log.warn("User with username '{}' not found", username);
            return new EntityNotFoundException("User not found");
        });
        var role = roleRepository.findByName(roleName).orElseThrow(() -> {
            log.warn("Role '{}' not found", roleName);
            return new EntityNotFoundException("Role not found");
        });
        if (user.getRoles().contains(role)) {
            log.warn("User '{}' already has role '{}'", username, roleName);
            throw new IllegalStateException("User already has this role");
        }
        user.addRole(role);
        user.setRoles(user.getRoles());
        log.info("Successfully assigned role {} to user {}", roleName, username);
        return user;
    }

    @Transactional
    public User removeRoleFromUser(String username, RoleType roleName) {
        log.info("Attempting to remove role {} from user {}", roleName, username);

        var user = userRepository.findByUsername(username).orElseThrow(() -> {
            log.warn("User not found with username {}", username);
            return new EntityNotFoundException("User not found");
        });

        var role = roleRepository.findByName(roleName).orElseThrow(() -> {
            log.warn("Role not found: '{}'", roleName);
            return new EntityNotFoundException("Role not found");
        });

        if (!user.getRoles().contains(role)) {
            log.warn("User '{}' does not have role '{}'", username, roleName);
            throw new IllegalStateException("User does not have this role");
        }

        user.removeRole(role);
        log.info("Successfully removed role {} from user {}", roleName, username);
        user.setRoles(user.getRoles());
        return user;
    }
}
