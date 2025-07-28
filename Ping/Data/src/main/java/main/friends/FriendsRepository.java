package main.friends;

import main.friends.Enums.FriendshipRequestType;
import main.users.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendsRepository extends JpaRepository<Friendship, Long> {
    @Query("select f from Friendship f where (f.sender = :sender and f.receiver = :receiver) or " +
            "(f.sender = :receiver and f.receiver = :sender)")
    Optional<Friendship> isFriendshipBetweenUsers(@Param("sender") User sender, @Param("receiver") User receiver);

    @Query("select f from Friendship f join fetch f.receiver join fetch " +
            "f.sender where f.receiver = :receiver and f.friendshipRequestType = :requestType")
    List<Friendship> pendingRequestsByUser(@Param("receiver") User receiver, @Param("requestType") FriendshipRequestType requestType);

    @Query("select f from Friendship f join fetch f.receiver join fetch" +
            " f.sender where (f.receiver = :receiver or f.sender =:receiver) and f.friendshipRequestType = :requestType")
    List<Friendship> acceptedRequestByUser(@Param("receiver") User receiver, @Param("requestType") FriendshipRequestType requestType);

    @Query("select distinct f2.receiver from Friendship f1 join Friendship " +
            "f2 on f1.receiver = f2.sender where f1.sender = :user and f2.receiver != :user" +
            " and f2.receiver not in (select f3.receiver from Friendship f3 where f3.sender = :user)")
    List<User> suggestedFriends(@Param("user") User user);
}
