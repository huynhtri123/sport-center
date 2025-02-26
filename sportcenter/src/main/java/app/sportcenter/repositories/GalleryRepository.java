package app.sportcenter.repositories;

import app.sportcenter.models.entities.Gallery;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GalleryRepository extends MongoRepository<Gallery, String> {
    public List<Gallery> getByIsActiveTrueAndIsDeletedFalse();
}
