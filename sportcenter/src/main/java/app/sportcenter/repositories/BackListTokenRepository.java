package app.sportcenter.repositories;

import app.sportcenter.models.entities.BlackListToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BackListTokenRepository extends MongoRepository<BlackListToken, String> {
    Optional<BlackListToken> getBackListTokenByToken(String token);
}
