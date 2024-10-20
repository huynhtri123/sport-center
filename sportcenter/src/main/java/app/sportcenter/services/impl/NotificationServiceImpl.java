package app.sportcenter.services.impl;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.NotificationRequest;
import app.sportcenter.models.dto.NotificationResponse;
import app.sportcenter.models.entities.Notification;
import app.sportcenter.models.entities.User;
import app.sportcenter.repositories.NotificationRepository;
import app.sportcenter.services.NotificationService;
import app.sportcenter.utils.mappers.NotificationMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepo;
    @Autowired
    private NotificationMapper mapper;

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> create(NotificationRequest notificationRequest) {
        if (notificationRequest == null) {
            throw new CustomException("Không có input!", HttpStatus.BAD_REQUEST.value());
        }

        Notification notification = mapper.convertToEntity(notificationRequest);
        Notification savedNotification = notificationRepo.save(notification);

        NotificationResponse response = mapper.convertToDTO(savedNotification);

        return ResponseEntity.ok(
                new BaseResponse("Tạo mới Notification thành công.", HttpStatus.OK.value(), response)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getById(String notiId) {
        Notification notification = notificationRepo.findById(notiId)
                .orElseThrow(() -> new CustomException("Không tìm thấy thông báo có id này", HttpStatus.NOT_FOUND.value()));

        NotificationResponse response = mapper.convertToDTO(notification);
        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy thông báo có id này.", HttpStatus.OK.value(), response)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getAllActive() {
        List<NotificationResponse> responseList = notificationRepo.getNotificationByIsDeletedFalseAndIsActiveTrue()
                .stream()
                .map(mapper::convertToDTO)
                .toList();
        if (responseList.isEmpty()) {
            throw new CustomException("Không tìm thấy danh sách thông báo!", HttpStatus.NOT_FOUND.value());
        }

        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy danh sách thông báo.", HttpStatus.OK.value(), responseList)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getAllSoftDeleted() {
        List<NotificationResponse> responseList = notificationRepo.findByIsDeletedTrue()
                .stream()
                .map(mapper::convertToDTO)
                .toList();

        if (responseList.isEmpty()) {
            return ResponseEntity.ok(new BaseResponse("Không tìm thấy thông báo đã xóa mềm.", HttpStatus.NOT_FOUND.value(), responseList));
        }

        return ResponseEntity.ok(new BaseResponse("Tìm thấy thông báo đã xóa mềm.", HttpStatus.OK.value(), responseList));
    }

    @Override
    public ResponseEntity<BaseResponse> findByUserId(String userId) {
        List<NotificationResponse> responseList = notificationRepo.findByUser_IdAndIsDeletedFalseAndIsActiveTrue(userId)
                .stream()
                .map(mapper::convertToDTO)
                .toList();

        if (responseList.isEmpty()) {
            return ResponseEntity.ok(
                    new BaseResponse("Không tìm thấy thông báo cho userId: " + userId, HttpStatus.NOT_FOUND.value(), responseList)
            );
        }

        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy thông báo cho userId: " + userId, HttpStatus.OK.value(), responseList)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> findByTitle(String title) {
        List<NotificationResponse> responseList = notificationRepo.findByTitleContainingIgnoreCaseAndIsActiveTrueAndIsDeletedFalse(title.trim())
                .stream()
                .map(mapper::convertToDTO)
                .toList();

        if (responseList.isEmpty()) {
            return ResponseEntity.ok(
                    new BaseResponse("Không tìm thấy thông báo với tiêu đề: " + title, HttpStatus.NOT_FOUND.value(), responseList)
            );
        }

        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy thông báo với tiêu đề: " + title, HttpStatus.OK.value(), responseList)
        );
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> update(String notificationId, NotificationRequest notificationRequest) {
        Notification notification = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new CustomException("Thông báo không tồn tại!", HttpStatus.NOT_FOUND.value()));

        // cập nhật các trường của thông báo
        notification.setTitle(notificationRequest.getTitle());
        notification.setContent(notificationRequest.getContent());

        Notification updatedNotification = notificationRepo.save(notification);
        NotificationResponse response = mapper.convertToDTO(updatedNotification);

        return ResponseEntity.ok(new BaseResponse("Cập nhật thông báo thành công.", HttpStatus.OK.value(), response));
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> softDelete(String notificationId) {
        Notification notification = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new CustomException("Thông báo không tồn tại!", HttpStatus.NOT_FOUND.value()));

        notification.setIsDeleted(true);
        NotificationResponse response = mapper.convertToDTO(notificationRepo.save(notification));

        return ResponseEntity.ok(new BaseResponse("Xoá mềm thông báo thành công.", HttpStatus.OK.value(), response));
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> restore(String notificationId) {
        Notification notification = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new CustomException("Thông báo không tồn tại!", HttpStatus.NOT_FOUND.value()));

        notification.setIsDeleted(false);
        NotificationResponse response = mapper.convertToDTO(notificationRepo.save(notification));

        return ResponseEntity.ok(new BaseResponse("Khôi phục thông báo thành công.", HttpStatus.OK.value(), response));
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> forceDelete(String notificationId) {
        if (!notificationRepo.existsById(notificationId)) {
            throw new CustomException("Thông báo không tồn tại!", HttpStatus.NOT_FOUND.value());
        }

        notificationRepo.deleteById(notificationId);

        return ResponseEntity.ok(new BaseResponse("Xoá cứng thông báo thành công.", HttpStatus.OK.value(), notificationId));
    }

    @Override
    public ResponseEntity<BaseResponse> getNotificationsForCurrentUser(String userId) {
        // Lấy thông tin người dùng hiện tại từ SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        String currentUserId = currentUser.getId();
        log.info(currentUserId);

        // Kiểm tra xem userId truyền vào có trùng với userId trong JWT hay không
        if (!currentUserId.equals(userId)) {
            throw new CustomException("Bạn không có quyền truy cập thông báo của người khác.", HttpStatus.FORBIDDEN.value());
        }

        List<NotificationResponse> responseList = notificationRepo.findByUser_IdAndIsDeletedFalseAndIsActiveTrue(currentUserId)
                .stream()
                .map(mapper::convertToDTO)
                .toList();

        if (responseList.isEmpty()) {
            return ResponseEntity.ok(new BaseResponse("Không tìm thấy thông báo cho người dùng hiện tại.", HttpStatus.NOT_FOUND.value(), responseList));
        }

        return ResponseEntity.ok(new BaseResponse("Tìm thấy thông báo cho người dùng hiện tại.", HttpStatus.OK.value(), responseList));
    }


}
