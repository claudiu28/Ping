package main.posts;

import main.friends.Enums.FriendshipRequestType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostsRepository extends JpaRepository<Post, Long> {
    @Query("select p from Post p join fetch p.user where p.user.username = :username")
    List<Post> findByUsername(@Param("username") String username);

    @Query("""
                select p from Post p
                join fetch p.user u
                where u.username <> :username and exists (
                    select 1 from Friendship f
                    where f.friendshipRequestType = :status
                      and (
                          (f.sender.username = :username and f.receiver = u) or
                          (f.receiver.username = :username and f.sender = u)
                      )
                )
                order by p.id desc
            """)
    List<Post> feedByUsername(@Param("username") String username, @Param("status") FriendshipRequestType status);
}

