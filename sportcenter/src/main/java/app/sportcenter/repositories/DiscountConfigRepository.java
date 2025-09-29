package app.sportcenter.repositories;

import app.sportcenter.commons.DiscountType;
import app.sportcenter.models.entities.DiscountConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiscountConfigRepository extends MongoRepository<DiscountConfig, String> {

    public List<DiscountConfig> getByIsActiveTrueAndIsDeletedFalse();

    Optional<DiscountConfig> findByTypeAndIsActiveTrueAndIsDeletedFalse(DiscountType type);

}
