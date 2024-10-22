package app.sportcenter.repositories;

import app.sportcenter.models.entities.Tounament;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TounamentRepository extends MongoRepository<Tounament, String> {
    Tounament getTounamentById(String id);
    List<Tounament> getByIsDeletedFalse();
}
