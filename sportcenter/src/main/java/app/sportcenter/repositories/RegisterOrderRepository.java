package app.sportcenter.repositories;

import app.sportcenter.commons.OrderStatus;
import app.sportcenter.models.entities.RegisterOrder;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;

@Repository
public interface RegisterOrderRepository extends MongoRepository<RegisterOrder, String> {

    @Query("{'orderStatus': ?0, 'createdAt': { $lt: ?1 }}")
    List<RegisterOrder> findByOrderStatusAndCreatedAtBefore(OrderStatus orderStatus, ZonedDateTime time);

    @Query("{ 'tournamentId': ?0, 'isDeleted': false, 'isActive': true }")
    List<RegisterOrder> findByTournamentId(String tournamentId);
}
