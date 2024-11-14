package app.sportcenter.repositories;

import app.sportcenter.models.entities.RecurringBooking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecurringBookingRepository extends MongoRepository<RecurringBooking, String> {

}
