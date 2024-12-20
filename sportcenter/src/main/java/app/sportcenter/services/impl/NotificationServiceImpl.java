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
            throw new CustomException("No input provided!", HttpStatus.BAD_REQUEST.value());
        }

        Notification notification = mapper.convertToEntity(notificationRequest);
        Notification savedNotification = notificationRepo.save(notification);

        NotificationResponse response = mapper.convertToDTO(savedNotification);

        return ResponseEntity.ok(
                new BaseResponse("Notification created successfully.", HttpStatus.OK.value(), response)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getById(String notiId) {
        Notification notification = notificationRepo.findById(notiId)
                .orElseThrow(() -> new CustomException("No notification found with this ID.", HttpStatus.NOT_FOUND.value()));

        NotificationResponse response = mapper.convertToDTO(notification);
        return ResponseEntity.ok(
                new BaseResponse("Notification found with this ID.", HttpStatus.OK.value(), response)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getAllActive() {
        List<NotificationResponse> responseList = notificationRepo.getNotificationByIsDeletedFalseAndIsActiveTrue()
                .stream()
                .map(mapper::convertToDTO)
                .toList();
        if (responseList.isEmpty()) {
            throw new CustomException("Notification list not found!", HttpStatus.NOT_FOUND.value());
        }

        return ResponseEntity.ok(
                new BaseResponse("Notification list found.", HttpStatus.OK.value(), responseList)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getAllSoftDeleted() {
        List<NotificationResponse> responseList = notificationRepo.findByIsDeletedTrue()
                .stream()
                .map(mapper::convertToDTO)
                .toList();

        if (responseList.isEmpty()) {
            return ResponseEntity.ok(new BaseResponse("No soft-deleted notification found.", HttpStatus.NOT_FOUND.value(), responseList));
        }

        return ResponseEntity.ok(new BaseResponse("Soft-deleted notification found.", HttpStatus.OK.value(), responseList));
    }

    @Override
    public ResponseEntity<BaseResponse> findByUserId(String userId) {
        List<NotificationResponse> responseList = notificationRepo.findByUser_IdAndIsDeletedFalseAndIsActiveTrue(userId)
                .stream()
                .map(mapper::convertToDTO)
                .toList();

        if (responseList.isEmpty()) {
            return ResponseEntity.ok(
                    new BaseResponse("No notification found for userId: " + userId, HttpStatus.NOT_FOUND.value(), responseList)
            );
        }

        return ResponseEntity.ok(
                new BaseResponse("Notification found for userId: " + userId, HttpStatus.OK.value(), responseList)
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
                    new BaseResponse("No notification found with the title: " + title, HttpStatus.NOT_FOUND.value(), responseList)
            );
        }

        return ResponseEntity.ok(
                new BaseResponse("Notification found with the title: " + title, HttpStatus.OK.value(), responseList)
        );
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> update(String notificationId, NotificationRequest notificationRequest) {
        Notification notification = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new CustomException("The notification does not exist!", HttpStatus.NOT_FOUND.value()));

        // cập nhật các trường của thông báo
        notification.setTitle(notificationRequest.getTitle());
        notification.setContent(notificationRequest.getContent());

        Notification updatedNotification = notificationRepo.save(notification);
        NotificationResponse response = mapper.convertToDTO(updatedNotification);

        return ResponseEntity.ok(new BaseResponse("Notification updated successfully.", HttpStatus.OK.value(), response));
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> softDelete(String notificationId) {
        Notification notification = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new CustomException("The notification does not exist!", HttpStatus.NOT_FOUND.value()));

        notification.setIsDeleted(true);
        NotificationResponse response = mapper.convertToDTO(notificationRepo.save(notification));

        return ResponseEntity.ok(new BaseResponse("Soft delete of notification successful.", HttpStatus.OK.value(), response));
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> restore(String notificationId) {
        Notification notification = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new CustomException("The notification does not exist!", HttpStatus.NOT_FOUND.value()));

        notification.setIsDeleted(false);
        NotificationResponse response = mapper.convertToDTO(notificationRepo.save(notification));

        return ResponseEntity.ok(new BaseResponse("Notification restored successfully.", HttpStatus.OK.value(), response));
    }

    @Transactional
    @Override
    public ResponseEntity<BaseResponse> forceDelete(String notificationId) {
        if (!notificationRepo.existsById(notificationId)) {
            throw new CustomException("The notification does not exist!", HttpStatus.NOT_FOUND.value());
        }

        notificationRepo.deleteById(notificationId);

        return ResponseEntity.ok(new BaseResponse("Notification permanently deleted successfully.", HttpStatus.OK.value(), notificationId));
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
            throw new CustomException("You do not have permission to access someone else's notification.", HttpStatus.FORBIDDEN.value());
        }

        List<NotificationResponse> responseList = notificationRepo.findByUser_IdAndIsDeletedFalseAndIsActiveTrue(currentUserId)
                .stream()
                .map(mapper::convertToDTO)
                .toList();

        if (responseList.isEmpty()) {
            return ResponseEntity.ok(new BaseResponse("No notification found for the current user.", HttpStatus.NOT_FOUND.value(), responseList));
        }

        return ResponseEntity.ok(new BaseResponse("Notification found for the current user.", HttpStatus.OK.value(), responseList));
    }


}
