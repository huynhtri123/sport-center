package app.sportcenter.repositories;

import app.sportcenter.models.entities.Team;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamRepository extends MongoRepository<Team, String> {
    public Team findByName(String name);
}
