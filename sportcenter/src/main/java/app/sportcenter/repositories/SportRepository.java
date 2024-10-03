package app.sportcenter.repositories;

import app.sportcenter.models.entities.Sport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SportRepository extends MongoRepository<Sport, String> {
    public Sport getSportById(String id);
    public List<Sport> getByIsDeletedTrue();
    public List<Sport> getByIsDeletedFalse();

}
