package main.interfaces;

import main.users.User;

import java.util.List;
import java.util.Optional;

public interface IUserService {
    List<User> findByLastName(String lastName);

    List<User> findByFirstName(String firstName);

    List<User> findAll();

    Optional<User> findByUsername(String username);

    Optional<User> findByPhone(String phone);

    List<User> searchUsers(String keyword);

    User updateInfos(String username, String lastName, String firstName, String bio, String phone);

    User deleteUser(String username);

    User uploadProfilePicture(String username, String url);

    User removeProfilePicture(String username);
}

