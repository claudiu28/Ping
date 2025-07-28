package main.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import main.dto.request.user.UpdateInfoRequest;
import main.interfaces.IUserService;
import main.storage.Enums.StorageType;
import main.storage.StorageService;
import main.users.User;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class UserController {

    private final IUserService userService;
    private final StorageService storageService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @PatchMapping("/update-info")
    public ResponseEntity<?> updateUser(@RequestParam("username") String username, @RequestBody UpdateInfoRequest request) {
        log.info("Request to update user info for '{}'", username);
        try {
            var user = userService.updateInfos(username, request.getLastName(), request.getFirstName(), request.getBio(), request.getPhone());
            log.info("User info updated successfully for '{}'", username);
            simpMessagingTemplate.convertAndSend("/topic/update-info/" + user.getUsername(),user);
            return ResponseEntity.ok(user);
        } catch (Exception ex) {
            log.error("Failed to update user '{}': {}", username, ex.getMessage());
            return ResponseEntity.internalServerError().body(ex.getMessage());
        }
    }

    @PostMapping(value = "/upload-picture", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadProfilePicture(@RequestParam("username") String username, @RequestPart("file") MultipartFile file) {
        log.info("Uploading profile picture for '{}'", username);
        try {
            var storageFile = storageService.store(file, StorageType.PROFILES);
            var user = userService.uploadProfilePicture(username, storageFile);
            log.info("Profile picture uploaded for '{}'", username);
            simpMessagingTemplate.convertAndSend("/topic/update-picture/" + user.getUsername(),user);
            return ResponseEntity.ok(user);
        } catch (Exception ex) {
            log.error("Failed to upload profile picture for '{}': {}", username, ex.getMessage());
            return ResponseEntity.internalServerError().body(ex.getMessage());
        }
    }

    @PostMapping("/delete-picture")
    public ResponseEntity<?> deleteProfilePicture(@RequestParam("username") String username) {
        log.info("Request to delete profile picture for '{}'", username);
        try {
            User user = userService.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("User not found"));
            String filePath = user.getProfilePicture();
            storageService.delete(filePath);
            var userUpdated = userService.removeProfilePicture(username);
            log.info("Profile picture removed for '{}'", username);
            simpMessagingTemplate.convertAndSend("/topic/update-picture/" + user.getUsername(),user);
            return ResponseEntity.ok(userUpdated);
        } catch (Exception ex) {
            log.error("Failed to delete profile picture for '{}': {}", username, ex.getMessage());
            return ResponseEntity.internalServerError().body(ex.getMessage());
        }
    }

    @GetMapping("/username")
    public ResponseEntity<?> findByUsername(@RequestParam("username") String username) {
        log.info("Searching user by username '{}'", username);
        try {
            var user = userService.findByUsername(username);
            return ResponseEntity.ok(user);
        } catch (Exception ex) {
            log.error("Failed to find user '{}': {}", username, ex.getMessage());
            return ResponseEntity.internalServerError().body(ex.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam("keyword") String keyword) {
        log.info("Searching users with keyword '{}'", keyword);
        try {
            List<User> users = userService.searchUsers(keyword);
            log.info("Found {} users for keyword '{}'", users.size(), keyword);
            return ResponseEntity.ok(users);
        } catch (Exception ex) {
            log.error("Error searching users with keyword '{}': {}", keyword, ex.getMessage());
            return ResponseEntity.internalServerError().body(ex.getMessage());
        }
    }
}
