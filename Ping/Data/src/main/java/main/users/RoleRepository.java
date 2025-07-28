package main.users;

import main.users.Enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role,Long> {
    @Query("select r from Role r join fetch r.users where r.name = :name")
    Optional<Role> findByName(@Param("name") RoleType name);
}
