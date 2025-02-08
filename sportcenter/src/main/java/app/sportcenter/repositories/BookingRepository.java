package app.sportcenter.repositories;

import app.sportcenter.models.entities.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    @Query("{ 'isActive': true, 'isDeleted': false }")
    public List<Booking> getAllActive();

    // tìm danh sách booking đã hết hạn (endTime < now)
    @Query("{ 'endTime' : { $lt: ?0 }, 'isActive': true, 'isDeleted': false }")
    public List<Booking> findExpiredBookings(ZonedDateTime now);

    // tìm danh sách: booking đã hết hạn (endTime < now) || overtime processing
    @Query("{'$or': [ " +
            "{ 'endTime' : { $lt: ?0 }, 'isActive': true, 'isDeleted': false }, " +
            "{ 'isProcessing': true, 'createdAt': { $lt: ?1 }, 'isActive': true, 'isDeleted': false }" +
            "]}")
    List<Booking> findExpiredOrStaleProcessingBookings(ZonedDateTime now, ZonedDateTime threshold);

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
    @Query("{ 'field._id': ?0, $and: [ { 'field.timeSlots': { $elemMatch: { 'status': 'IN_USE' } } }, { $or: [ { 'startTime': { $gte: ?1, $lt: ?2 } }, { 'endTime': { $gt: ?1, $lte: ?2 } }, { 'startTime': { $lt: ?1 }, 'endTime': { $gt: ?2 } } ] } ], 'isActive': true, 'isDeleted': false }")
    public List<Booking> findInUseTimeSlotsByFieldAndTimeRange(String fieldId, ZonedDateTime startTime, ZonedDateTime endTime);

    // tìm booking theo loại (đặt lẻ hay cứng)
    @Query("{ 'isRecurring':  ?0, 'isDeleted':  false}")
    public List<Booking> findByBookingType(boolean isRecurring);

    @Query("{ 'isActive': true, 'isDeleted': false }")
    Page<Booking> findAllActive(Pageable pageable);

    @Query("{ 'field.fieldName': { $regex: ?0, $options: 'i' }, 'isDeleted': false, 'isActive': true }")
    Page<Booking> searchByFieldName(String fieldName, Pageable pageable);

    @Query("{ 'bookingDate': { $gte: ?0 } }")
    List<Booking> findBookingsLastSixMonths(@Param("startDate") ZonedDateTime startDate);

    @Query("{ 'recurringBooking.id': ?0 }")
    List<Booking> findByRecurringBookingId(@Param("recurringBookingId") String recurringBookingId);
}
