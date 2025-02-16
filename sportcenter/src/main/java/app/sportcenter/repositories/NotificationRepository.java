package app.sportcenter.repositories;

import app.sportcenter.models.entities.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    Page<Notification> getNotificationByIsDeletedFalseAndIsActiveTrue(Pageable pageable);

    public List<Notification> findByTitleContainingIgnoreCaseAndIsActiveTrueAndIsDeletedFalse(String title);

    public List<Notification> findByIsDeletedTrue();

    Page<Notification> findByIdInAndIsActiveTrueAndIsDeletedFalse(List<String> ids, Pageable pageable);

}
