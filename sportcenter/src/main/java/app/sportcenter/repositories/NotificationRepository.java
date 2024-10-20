package app.sportcenter.repositories;

import app.sportcenter.models.entities.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    public List<Notification> getNotificationByIsDeletedFalseAndIsActiveTrue();
    public List<Notification> findByUser_IdAndIsDeletedFalseAndIsActiveTrue(String userId);
    public List<Notification> findByTitleContainingIgnoreCaseAndIsActiveTrueAndIsDeletedFalse(String title);
    public List<Notification> findByIsDeletedTrue();
}
