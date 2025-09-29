package app.sportcenter.repositories;

import app.sportcenter.models.entities.FieldStatusByDate;
import app.sportcenter.models.entities.TimeSlot;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FieldStatusByDateRepository extends MongoRepository<FieldStatusByDate, String> {

    // Tìm trạng thái sân theo fieldId và ngày (bỏ phần giờ)
    Optional<FieldStatusByDate> findByFieldIdAndDate(String fieldId, ZonedDateTime date);

    // Tìm các FieldStatus có timeSlots IN_USE trong khoảng thời gian cụ thể
    @Query("{ 'fieldId': ?0, " +
            "'timeSlots': { $elemMatch: { 'status': 'IN_USE', " +
            "  $or: [ " +
            "    { 'startTime': { $gte: ?1, $lt: ?2 } }, " +
            "    { 'endTime': { $gt: ?1, $lte: ?2 } }, " +
            "    { 'startTime': { $lt: ?1 }, 'endTime': { $gt: ?2 } } " +
            "  ] " +
            "} } " +
            "}")
    List<FieldStatusByDate> findInUseTimeSlotsByFieldAndTimeRange(String fieldId, ZonedDateTime startTime, ZonedDateTime endTime);

    @Query("{ 'fieldId': ?0, 'date': { $in: ?1 } }")
    List<FieldStatusByDate> findByFieldIdAndDateIn(String fieldId, List<ZonedDateTime> dates);
}

