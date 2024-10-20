package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.NotificationRequest;
import org.springframework.http.ResponseEntity;

public interface NotificationService {
    public ResponseEntity<BaseResponse> create(NotificationRequest notificationRequest);

    public ResponseEntity<BaseResponse> getById(String notiId);
    // lấy toàn bộ còn hoạt động (active & not deleted)
    public ResponseEntity<BaseResponse> getAllActive();
    ResponseEntity<BaseResponse> findByUserId(String userId);
    ResponseEntity<BaseResponse> findByTitle(String title);
    // lấy tất cả thông báo đã xóa mềm
    ResponseEntity<BaseResponse> getAllSoftDeleted();

    ResponseEntity<BaseResponse> update(String notificationId, NotificationRequest notificationRequest);

    ResponseEntity<BaseResponse> softDelete(String notificationId);
    ResponseEntity<BaseResponse> restore(String notificationId);
    ResponseEntity<BaseResponse> forceDelete(String notificationId);

    // người dùng tự lấy danh sách của mình
    ResponseEntity<BaseResponse> getNotificationsForCurrentUser(String userId);
}
