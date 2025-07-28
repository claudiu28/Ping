package main.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import main.interfaces.IUserService;
import main.users.User;
import main.users.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService implements IUserService {

    private final UserRepository userRepository;

    public List<User> findByLastName(String lastName) {
        log.info("Searching users with last name '{}'", lastName);
        return userRepository.findByLastName(lastName);
    }

    public List<User> findByFirstName(String firstName) {
        log.info("Searching users with first name '{}'", firstName);
        return userRepository.findByFirstName(firstName);
    }

    public List<User> findAll() {
        log.info("Fetching all users from database");
        return userRepository.findAll();
    }

    public Optional<User> findByUsername(String username) {
        log.info("Looking up user by username '{}'", username);
        return userRepository.findByUsername(username);
    }

    public Optional<User> findByPhone(String phone) {
        log.info("Looking up user by phone '{}'", phone);
        return userRepository.findByPhone(phone);
    }

    public List<User> searchUsers(String keyword) {
        log.info("Searching users by keyword '{}'", keyword);

        if (keyword == null || keyword.trim().isEmpty()) {
            log.warn("Keyword for user search is null or empty");
            throw new IllegalArgumentException("Keyword must not be empty");
        }

        List<User> result = userRepository.searchByKeyword(keyword.trim());
        log.info("Found {} users matching keyword '{}'", result.size(), keyword);
        return result;
    }

    @Transactional
    public User updateInfos(String username, String lastName, String firstName, String bio, String phone) {
        log.info("Attempting to update user infos for username '{}'", username);

        var user = userRepository.findByUsername(username).orElseThrow(() -> {
            log.warn("User '{}' not found for update", username);
            return new IllegalArgumentException("Not found user");
        });

        if (lastName == null || lastName.isEmpty()) {
            lastName = user.getLastName();
        }
        if (firstName == null || firstName.isEmpty()) {
            firstName = user.getFirstName();
        }
        if (bio == null || bio.isEmpty()) {
            bio = user.getBio();
        }
        if (phone == null || phone.isEmpty()) {
            phone = user.getPhone();
        }

        user.setLastName(lastName);
        user.setPhone(phone);
        user.setBio(bio);
        user.setFirstName(firstName);

        log.info("User '{}' updated successfully", username);
        return userRepository.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("Not found user"));
    }

    public User deleteUser(String username) {
        log.info("Attempting to delete user '{}'", username);
        var user = userRepository.findByUsername(username).orElseThrow(() -> {
            log.warn("User '{}' not found for deletion", username);
            return new IllegalArgumentException("Not found user");
        });

        userRepository.deleteById(user.getId());
        log.info("User '{}' deleted successfully", username);
        return user;
    }

    @Transactional
    public User uploadProfilePicture(String username, String url) {
        log.info("Uploading profile picture for user '{}'", username);

        var user = userRepository.findByUsername(username).orElseThrow(() -> {
            log.warn("User '{}' not found for uploading profile picture", username);
            return new IllegalArgumentException("Not found user");
        });

        user.setProfilePicture(url);
        log.info("Profile picture updated successfully for user '{}'", username);
        return user;
    }

    @Transactional
    public User removeProfilePicture(String username) {
        log.info("Remove profile picture for user '{}'", username);

        var user = userRepository.findByUsername(username).orElseThrow(() -> {
            log.warn("User '{}' not found for removing profile picture", username);
            return new IllegalArgumentException("Not found user");
        });

        user.setProfilePicture(null);
        log.info("Profile picture removed successfully for user '{}'", username);
        return user;
    }
}
