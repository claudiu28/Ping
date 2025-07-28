package main.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import main.dto.response.admin.AdminResponse;
import main.interfaces.IUserService;
import main.services.RoleService;
import main.users.Enums.RoleType;
import main.users.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class AdminController {

    private final IUserService userService;
    private final RoleService roleService;

    @GetMapping("/users/lastName")
    public ResponseEntity<?> findByLastName(@RequestParam("lastName") String lastName) {
        log.info("Admin request: find users by lastName = {}", lastName);
        try {
            List<User> users = userService.findByLastName(lastName);
            List<AdminResponse> responses = users.stream().map(user -> AdminResponse.builder()
                    .username(user.getUsername())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .bio(user.getBio())
                    .phone(user.getPhone())
                    .profilePicture(user.getProfilePicture())
                    .roles(user.getRoles().stream().map(role -> role.getName().name()).toArray(String[]::new))
                    .build()).toList();
            log.info("Found {} users with lastName = {}", users.size(), lastName);
            return ResponseEntity.ok(responses);
        } catch (Exception ex) {
            log.error("Error while finding users by lastName: {}", ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body("Error: " + ex.getMessage());
        }
    }

    @GetMapping("/users/firstName")
    public ResponseEntity<?> findByFirstName(@RequestParam("firstName") String firstName) {
        log.info("Admin request: find users by firstName = {}", firstName);
        try {
            List<User> users = userService.findByFirstName(firstName);
            List<AdminResponse> responses = users.stream().map(user -> AdminResponse.builder()
                    .username(user.getUsername())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .bio(user.getBio())
                    .phone(user.getPhone())
                    .profilePicture(user.getProfilePicture())
                    .roles(user.getRoles().stream().map(role -> role.getName().name()).toArray(String[]::new))
                    .build()).toList();
            log.info("Found {} users with firstName = {}", users.size(), firstName);
            return ResponseEntity.ok(responses);
        } catch (Exception ex) {
            log.error("Error while finding users by firstName: {}", ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body("Error: " + ex.getMessage());
        }
    }

    @GetMapping("/users/phone")
    public ResponseEntity<?> findByPhone(@RequestParam("phone") String phone) {
        log.info("Admin request: find users by phone = {}", phone);
        try {
            User user = userService.findByPhone(phone).orElseThrow(() -> new IllegalArgumentException("User nof found"));
            AdminResponse response = AdminResponse.builder()
                    .username(user.getUsername())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .bio(user.getBio())
                    .phone(user.getPhone())
                    .profilePicture(user.getProfilePicture())
                    .roles(user.getRoles().stream().map(role -> role.getName().name()).toArray(String[]::new))
                    .build();
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            log.error("Error while finding users by phone: {}", ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body("Error: " + ex.getMessage());
        }
    }

    @GetMapping("/users/all")
    public ResponseEntity<?> getAllUsers() {
        log.info("Admin request: get all users");
        try {
            List<User> users = userService.findAll();
            List<AdminResponse> responses = users.stream().map(user -> AdminResponse.builder()
                    .username(user.getUsername())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .bio(user.getBio())
                    .phone(user.getPhone())
                    .profilePicture(user.getProfilePicture())
                    .roles(user.getRoles().stream().map(role -> role.getName().name()).toArray(String[]::new))
                    .build()).toList();
            log.info("Returned {} users", users.size());
            return ResponseEntity.ok(responses);
        } catch (Exception ex) {
            log.error("Error while getting all users: {}", ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body("Error: " + ex.getMessage());
        }
    }

    @DeleteMapping("/user/{username}")
    public ResponseEntity<?> deleteUser(@PathVariable("username") String username) {
        log.info("Admin request: delete user {}", username);
        try {
            var deleted = userService.deleteUser(username);
            log.info("Deleted user {}", username);
            return ResponseEntity.ok(deleted);
        } catch (Exception ex) {
            log.error("Error while deleting user {}: {}", username, ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body("Error: " + ex.getMessage());
        }
    }

    @PostMapping("/role")
    public ResponseEntity<?> createRole(@RequestParam("name-role") RoleType role) {
        log.info("Admin request: create role {}", role.toString());
        try {
            var createdRole = roleService.createRole(role);
            log.info("Created role {}", role);
            return ResponseEntity.ok(role);
        } catch (Exception ex) {
            log.error("Error while creating role {}: {}", role, ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body("Error: " + ex.getMessage());
        }
    }

    @DeleteMapping("/role")
    public ResponseEntity<?> deleteRole(@RequestParam("name-role") RoleType name) {
        log.info("Admin request: delete role {}", name);
        try {

            roleService.deleteRole(name);
            log.info("Deleted role {}", name);
            return ResponseEntity.ok("Delete role success");
        } catch (Exception ex) {
            log.error("Error while deleting role {}: {}", name, ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body("Error: " + ex.getMessage());
        }
    }

    @PatchMapping("/role/assign-to-user")
    public ResponseEntity<?> assignRoleToUser(@RequestParam("username") String username, @RequestParam("role") RoleType name) {
        log.info("Admin request: assign role {} to user {}", name, username);
        System.out.println("Here");
        try {
            var updatedUser = roleService.assignRoleToUser(username, name);
            log.info("Successfully assigned role {} to user {}", name, username);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception ex) {
            log.error("Error while assigning role {} to user {}: {}", name, username, ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body("Error: " + ex.getMessage());
        }
    }

    @PatchMapping("/role/remove-to-user")
    public ResponseEntity<?> removeRoleFromUser(@RequestParam("username") String username, @RequestParam("role") RoleType name) {
        log.info("Admin request: remove role {} from user {}", name, username);
        try {

            var updatedUser = roleService.removeRoleFromUser(username, name);
            log.info("Successfully removed role {} from user {}", name, username);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception ex) {
            log.error("Error while removing role {} from user {}: {}", name, username, ex.getMessage(), ex);
            return ResponseEntity.internalServerError().body("Error: " + ex.getMessage());
        }
    }
}
