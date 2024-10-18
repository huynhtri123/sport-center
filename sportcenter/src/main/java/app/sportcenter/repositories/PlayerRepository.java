package app.sportcenter.repositories;

import app.sportcenter.models.entities.Player;
import app.sportcenter.models.entities.Sport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerRepository extends MongoRepository<Player, String> {

    Player getPlayerById(String id);
    public List<Player> getByIsDeletedFalse();
    List<Player> getByIsDeletedTrue();

}
