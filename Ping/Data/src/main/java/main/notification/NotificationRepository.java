package main.notification;

import main.users.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("select n from Notification n join fetch n.user where n.user = :user and n.isRead = false order by n.createdAt desc")
    List<Notification> findNotReadNotifications(@Param("user") User user);

    @Query("select n from Notification n join fetch n.user where n.user = :user order by n.createdAt desc")
    List<Notification> findByUser(@Param("user") User user);
}
