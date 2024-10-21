package app.sportcenter.repositories;

import app.sportcenter.models.entities.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    // tìm danh sách sân hết hạn và trạng thái đang được thuê (endTime<now & status=IN_USE)
    @Query("{ 'endTime' : { $lt: ?0 }, 'field.fieldStatus' : ?1 }")
    List<Booking> findExpiredBookings(ZonedDateTime now, String fieldStatus);
}
