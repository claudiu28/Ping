package main.users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResetTokenRepository extends JpaRepository<ResetToken, Long> {
    @Query("select rt from ResetToken rt where rt.user = :user and rt.code = :code")
    Optional<ResetToken> findByCodeAndUser(@Param("user") User user, @Param("code") String code);
}
