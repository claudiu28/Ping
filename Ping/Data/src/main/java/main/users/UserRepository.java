package main.users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    @Query("select distinct u from User u join fetch u.roles where u.username = :username")
    Optional<User> findByUsername(@Param("username") String username);

    @Query("select u from User u join fetch u.roles where u.phone = :phone")
    Optional<User> findByPhone(@Param("phone") String phone);

    @Query("select u from User u join fetch u.roles where u.lastName = :lastName")
    List<User> findByLastName(@Param("lastName") String lastName);

    @Query("select u from User u join fetch u.roles where u.firstName = :firstName")
    List<User> findByFirstName(@Param("firstName") String firstName);

    @Query("select u from User u join fetch u.roles")
    List<User> findAllUsers();

    @Query("select distinct u from User u join fetch u.roles " +
            "where lower(u.firstName) like lower(concat('%', :keyword, '%'))" +
            " or lower(u.lastName) like lower(concat('%', :keyword, '%')) " +
            "or lower(u.username) like lower(concat('%', :keyword, '%'))" +
            " or lower(u.phone) like lower(concat('%', :keyword, '%'))")
    List<User> searchByKeyword(@Param("keyword") String keyword);

}
