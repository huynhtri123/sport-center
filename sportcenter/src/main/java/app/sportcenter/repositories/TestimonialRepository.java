package app.sportcenter.repositories;

import app.sportcenter.models.entities.Testimonial;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestimonialRepository extends MongoRepository<Testimonial, String> {
    public List<Testimonial> getByIsActiveTrueAndIsDeletedFalse();
}
