package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.request.NotificationRequest;
import app.sportcenter.models.dto.response.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

public interface NotificationService {

    public NotificationResponse create(NotificationRequest notificationRequest);

    public NotificationResponse getById(String notiId);

    // lấy toàn bộ còn hoạt động (active & not deleted)
    public Page<NotificationResponse> getAllActive(int page, int size, String sortBy, String sortDir);

    ResponseEntity<BaseResponse> findByTitle(String title);
    // lấy tất cả thông báo đã xóa mềm
    ResponseEntity<BaseResponse> getAllSoftDeleted();

    ResponseEntity<BaseResponse> update(String notificationId, NotificationRequest notificationRequest);

    ResponseEntity<BaseResponse> softDelete(String notificationId);

    ResponseEntity<BaseResponse> restore(String notificationId);

    ResponseEntity<BaseResponse> forceDelete(String notificationId);

    Page<NotificationResponse> getNotificationsForUser(String userId, Pageable pageable);
}
