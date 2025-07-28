package main.services;

import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import main.friends.Enums.FriendshipRequestType;
import main.friends.FriendsRepository;
import main.friends.Friendship;
import main.interfaces.IFriendsService;
import main.users.User;
import main.users.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FriendsService implements IFriendsService {

    private final UserRepository userRepository;
    private final FriendsRepository friendsRepository;

    @Override
    public Friendship sendRequest(String senderUsername, String receiverUsername) {
        log.info("Attempting to send friendship request from '{}' to '{}'", senderUsername, receiverUsername);
        User sender = userRepository.findByUsername(senderUsername).orElseThrow(() -> {
            log.warn("Sender '{}' not found", senderUsername);
            return new EntityNotFoundException("Sender not found");
        });

        User receiver = userRepository.findByUsername(receiverUsername).orElseThrow(() -> {
            log.warn("Receiver '{}' not found", receiverUsername);
            return new EntityNotFoundException("Receiver not found");
        });

        friendsRepository.isFriendshipBetweenUsers(sender, receiver).ifPresent(f -> {
            log.warn("Friendship already exists between '{}' and '{}'", senderUsername, receiverUsername);
            throw new IllegalStateException("Friendship already exists");
        });

        Friendship friendship = Friendship.builder().sender(sender).receiver(receiver).friendshipRequestType(FriendshipRequestType.Pending).build();

        sender.addFriendshipAsSender(friendship);
        receiver.addFriendshipAsReceiver(friendship);

        Friendship saved = friendsRepository.save(friendship);
        log.info("Friendship request successfully created with ID={} from '{}' to '{}'", saved.getId(), senderUsername, receiverUsername);
        return saved;
    }

    @Override
    @Transactional
    public void deleteFriendship(Long friendshipId) {
        log.info("Attempting to delete friendship with ID={}", friendshipId);

        Friendship friendship = friendsRepository.findById(friendshipId).orElseThrow(() -> {
            log.warn("Friendship with ID={} not found", friendshipId);
            return new EntityNotFoundException("Friendship not found");
        });

        User sender = friendship.getSender();
        User receiver = friendship.getReceiver();

        sender.removeFriendshipAsSender(friendship);
        receiver.removeFriendshipAsReceiver(friendship);
        log.info("Friendship between '{}' and '{}' successfully deleted", sender.getUsername(), receiver.getUsername());
    }

    @Override
    @Transactional
    public Friendship respondRequest(Long friendshipId, FriendshipRequestType type) {
        log.info("Fetching friendships for friendship with id '{}'", friendshipId);
        Friendship friendship = friendsRepository.findById(friendshipId).orElseThrow(
                () -> {
                    log.warn("Friendship'{}' not found while fetching", friendshipId);
                    return new EntityNotFoundException("Friendship not found");
                }
        );
        friendship.setFriendshipRequestType(type);
        log.info("Friendship request #{} was updated to {}", friendshipId, type);
        return friendship;
    }

    @Override
    public List<Friendship> getAllPendingFriendships(String username) {
        log.info("Fetching all pending friendships for user '{}'", username);
        User user = userRepository.findByUsername(username).orElseThrow(() -> {
            log.warn("User '{}' not found while fetching pending friendships", username);
            return new EntityNotFoundException("User not found");
        });
        List<Friendship> friendships = friendsRepository.pendingRequestsByUser(user, FriendshipRequestType.Pending);
        log.info("Found {} pending friendships for user '{}'", friendships.size(), username);
        return friendships;
    }

    @Override
    public List<Friendship> getAllAcceptedFriendships(String username) {
        log.info("Fetching all accepted friendships for user '{}'", username);
        User user = userRepository.findByUsername(username).orElseThrow(() -> {
            log.warn("User '{}' not found while fetching accepted friendships", username);
            return new EntityNotFoundException("User not found");
        });
        List<Friendship> friendships = friendsRepository.acceptedRequestByUser(user, FriendshipRequestType.Accepted);
        log.info("Found {} accepted friendships for user '{}'", friendships.size(), username);
        return friendships;
    }

    @Override
    public List<User> getSuggestedFriends(String username) {
        log.info("Fetching all suggested friendships for user '{}'", username);
        User user = userRepository.findByUsername(username).orElseThrow(() -> new EntityExistsException("User not found"));
        List<User> suggestions = friendsRepository.suggestedFriends(user);
        log.info("Suggested {} friends for user {}", suggestions.size(), username);
        return suggestions;
    }
}
