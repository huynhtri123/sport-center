package app.sportcenter.repositories;

import app.sportcenter.models.entities.BackListToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BackListTokenRepository extends MongoRepository<BackListToken, String> {
    Optional<BackListToken> getBackListTokenByToken(String token);
}
