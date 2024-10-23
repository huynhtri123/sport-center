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

    // tìm danh sách booking đã hết hạn (endTime < now)
    @Query("{ 'endTime' : { $lt: ?0 }, 'isActive': true, 'isDeleted': false }")
    public List<Booking> findExpiredBookings(ZonedDateTime now);

    @Query("{ 'user._id':  ?0, 'isActive': true, 'isDeleted': false }")
    public List<Booking> findBookingByUserId(String userId);

    @Query("{ 'user._id':  ?0, 'endTime' : { $gt: ?1 }, 'field.timeSlots': { $elemMatch: { 'status': ?2 }}, 'isActive': true, 'isDeleted': false }")
    public List<Booking> getCurrentBookingsOfCurrentUser(String userId, ZonedDateTime now, String fieldStatus);

    @Query("{ 'field._id':  ?0, 'isActive': true, 'isDeleted': false }")
    public List<Booking> getBookingByFieldId(String fieldId);

    @Query("{ 'startTime': ?0, 'isActive': true, 'isDeleted': false }")
    public List<Booking> getBookingByStartTime(ZonedDateTime startTime);

    // lấy tất cả booking của sân trong khoảng thời gian cụ thể (ví dụ: 7:00 - 22:00)
    @Query("{ 'field._id': ?0, $or: [ { 'startTime': { $gte: ?1, $lt: ?2 } }, { 'endTime': { $gt: ?1, $lte: ?2 } }, { 'startTime': { $lt: ?1 }, 'endTime': { $gt: ?2 } } ], 'isActive': true, 'isDeleted': false }")
    public List<Booking> findBookingsByFieldAndTimeRange(String fieldId, ZonedDateTime startOfDay, ZonedDateTime endOfDay);

    // tìm các booking có timeSlots có trạng thái IN_USE trong khoảng thời gian cụ thể
//    @Query("{ 'field._id': ?0,  'field.timeSlots': { $elemMatch:  { 'status':  'IN_USE'}}, 'isActive': true, 'isDeleted': false }")
    @Query("{ 'field._id': ?0, $and: [ { 'field.timeSlots': { $elemMatch: { 'status': 'IN_USE' } } }, { $or: [ { 'startTime': { $gte: ?1, $lt: ?2 } }, { 'endTime': { $gt: ?1, $lte: ?2 } }, { 'startTime': { $lt: ?1 }, 'endTime': { $gt: ?2 } } ] } ], 'isActive': true, 'isDeleted': false }")
    public List<Booking> findInUseTimeSlotsByFieldAndTimeRange(String fieldId, ZonedDateTime startTime, ZonedDateTime endTime);

}
