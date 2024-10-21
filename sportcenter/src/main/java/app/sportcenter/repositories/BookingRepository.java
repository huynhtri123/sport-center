package app.sportcenter.repositories;

import app.sportcenter.models.entities.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.ResourceBundle;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    @Query("{ 'isActive': true, 'isDeleted': false }")
    public List<Booking> getAllActive();

    // tìm danh sách sân hết hạn và trạng thái đang được thuê (endTime<now)
    @Query("{ 'endTime' : { $lt: ?0 }, 'field.fieldStatus' : ?1, 'isActive': true, 'isDeleted': false }")
    public List<Booking> findExpiredBookings(ZonedDateTime now, String fieldStatus);

    @Query("{ 'user._id':  ?0, 'isActive': true, 'isDeleted': false }")
    public List<Booking> findBookingByUserId(String userId);

    @Query("{ 'user._id':  ?0, 'endTime' : { $gt: ?1 }, 'field.fieldStatus' : ?2, 'isActive': true, 'isDeleted': false }")
    public List<Booking> getCurrentBookingsOfCurrentUser(String userId, ZonedDateTime now, String fieldStatus);

    @Query("{ 'field._id':  ?0, 'isActive': true, 'isDeleted': false }")
    public List<Booking> getBookingByFieldId(String fieldId);

    @Query("{ 'startTime': ?0, 'isActive': true, 'isDeleted': false }")
    public List<Booking> getBookingByStartTime(ZonedDateTime startTime);
}
