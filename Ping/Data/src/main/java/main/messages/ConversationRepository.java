package main.messages;

import main.users.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    @Query("select c from Conversation c join fetch c.participants where :user member of c.participants order by c.createdAt desc")
    List<Conversation> findConversationsByUser(@Param("user") User user);
}
