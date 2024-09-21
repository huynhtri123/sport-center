package app.sportcenter.repositories;

import app.sportcenter.commons.Role;
import app.sportcenter.models.entities.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    public Optional<User> getUserByEmail(String email);
    public boolean existsByEmail(String email);
    public boolean existsByRole(Role role);
}
