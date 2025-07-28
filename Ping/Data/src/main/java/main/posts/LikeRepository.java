package main.posts;

import main.users.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    @Query("select count(l) from Like l where l.post = :post")
    Long countLikesPerPost(@Param("post") Post post);

    @Query("select case when count(l) > 0 then true else false end from Like l where l.post = :post and l.user = :user")
    boolean existsLike(@Param("post") Post post, @Param("user") User user);

    @Query("select l from Like l where l.post = :post and l.user = :user")
    Optional<Like> foundLike(@Param("post") Post post, @Param("user") User user);

    @Query("select l from Like l join fetch l.post where l.user = :user")
    List<Like> foundLikeUser(@Param("user") User user);
}
