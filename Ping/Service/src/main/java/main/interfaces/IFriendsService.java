package main.interfaces;

import main.friends.Enums.FriendshipRequestType;
import main.friends.Friendship;
import main.users.User;

import java.util.List;

public interface IFriendsService {
    Friendship sendRequest(String senderUsername, String receiverUsername);

    Friendship respondRequest(Long friendshipId, FriendshipRequestType type);

    List<Friendship> getAllPendingFriendships(String username);

    List<Friendship> getAllAcceptedFriendships(String username);

    List<User> getSuggestedFriends(String username);

    void deleteFriendship(Long friendshipId);

}
