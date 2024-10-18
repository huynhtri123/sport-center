package app.sportcenter.repositories;

import app.sportcenter.models.entities.Team;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends MongoRepository<Team, String> {
//    public Team findByName(String name);
    public Team getTeamById(String id);
    public List<Team> getByIsDeletedFalse();
}
