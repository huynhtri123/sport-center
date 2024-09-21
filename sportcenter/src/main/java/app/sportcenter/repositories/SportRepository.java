package app.sportcenter.repositories;

import app.sportcenter.models.entities.Sport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SportRepository extends MongoRepository<Sport, String> {
}
