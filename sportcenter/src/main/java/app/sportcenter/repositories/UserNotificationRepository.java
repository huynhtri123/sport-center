package app.sportcenter.repositories;

import app.sportcenter.models.entities.UserNotification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserNotificationRepository extends MongoRepository<UserNotification, String> {
    Page<UserNotification> getByIsActiveTrueAndIsDeletedFalse(Pageable pageable);

    boolean existsByUserIdAndNotificationId(String userId, String notificationId);

    Page<UserNotification> getByUserId(String userId, Pageable pageable);

    List<UserNotification> getByUserId(String userId);

    @Query(value = "{ 'notificationId': ?0 }", fields = "{ 'userId' : 1, '_id': 0 }")
    List<String> findUserIdsByNotificationId(String notificationId);

}
