package app.sportcenter.repositories;

import app.sportcenter.commons.RecurringIntervalType;
import app.sportcenter.models.entities.RecurringBooking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;

@Repository
public interface RecurringBookingRepository extends MongoRepository<RecurringBooking, String> {

    @Query("{'interval':  ?0, 'isDeleted':  false}")
    public List<RecurringBooking> findByRecurringBookingType(RecurringIntervalType type);

    @Query("{ 'bookingIds': { $in: [?0] }, 'isActive': true, 'isDeleted': false }")
    public RecurringBooking getByContainBookingId(String bookingId);

    @Query("SELECT rb FROM RecurringBooking rb WHERE rb.startDate >= :startDate")
    List<RecurringBooking> findRecurringBookingsLastSixMonths(@Param("startDate") ZonedDateTime startDate);
}
