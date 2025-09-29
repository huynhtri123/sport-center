package app.sportcenter.repositories;

import app.sportcenter.models.entities.Banner;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends MongoRepository<Banner, String> {
    public List<Banner> getByIsActiveTrueAndIsDeletedFalse();
}

