package main.messages;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessagesRepository extends JpaRepository<Message, Long> {
    @Query("select m from Message m join fetch m.user where m.conversation = :conversation")
    List<Message> findByConversation(@Param("conversation") Conversation conversation);
}
