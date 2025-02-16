package app.sportcenter.services.impl;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.exceptions.NotFoundException;
import app.sportcenter.models.dto.NotificationRequest;
import app.sportcenter.models.dto.NotificationResponse;
import app.sportcenter.models.dto.UserResponse;
import app.sportcenter.models.entities.Notification;
import app.sportcenter.models.entities.UserNotification;
import app.sportcenter.repositories.NotificationRepository;
import app.sportcenter.repositories.UserNotificationRepository;
import app.sportcenter.services.NotificationService;
import app.sportcenter.services.UserService;
import app.sportcenter.utils.mappers.NotificationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepo;
    private final NotificationMapper mapper;
    private final UserService userService;
    private final UserNotificationRepository userNotificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    @Override
    public NotificationResponse create(NotificationRequest notificationRequest) {
        if (notificationRequest == null) {
            throw new CustomException("No input provided!", HttpStatus.BAD_REQUEST.value());
        }

        Notification notification = mapper.convertToEntity(notificationRequest);
        Notification savedNotification = notificationRepo.save(notification);
        String notificationId = savedNotification.getId();

        List<UserResponse> allUsers = userService.getAllActive();
        List<String> userIds = allUsers.stream().map(UserResponse::getId).toList();

        // Lấy danh sách user đã có thông báo để tránh duplicate
        Set<String> existingUserIds = new HashSet<>(userNotificationRepository.findUserIdsByNotificationId(notificationId));

        List<UserNotification> newUserNotifications = userIds.stream()
                .filter(userId -> !existingUserIds.contains(userId)) // Bỏ qua user đã có thông báo
                .map(userId -> new UserNotification(null, userId, notificationId, false, null))
                .toList();

        if (!newUserNotifications.isEmpty()) {
            userNotificationRepository.saveAll(newUserNotifications);
        }

        // websocket: send notification
        messagingTemplate.convertAndSend("/topic/notification-updates", Map.of("message", "New notification!"));

        return mapper.convertToDTO(savedNotification);
    }

    @Override
    public NotificationResponse getById(String notiId) {
        Notification notification = notificationRepo.findById(notiId)
                .orElseThrow(() -> new CustomException("No notification found with id: " + notiId, HttpStatus.NOT_FOUND.value()));

        return mapper.convertToDTO(notification);
    }

    @Override
    public Page<NotificationResponse> getAllActive(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Notification> notificationPage = notificationRepo.getNotificationByIsDeletedFalseAndIsActiveTrue(pageable);

        if (notificationPage.isEmpty()) {
            throw new CustomException("No active notifications found!", HttpStatus.NOT_FOUND.value());
        }

        return notificationPage.map(mapper::convertToDTO);
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
    public Page<NotificationResponse> getNotificationsForUser(String userId, Pageable pageable) {
        UserResponse user = userService.getUserById(userId);
        if (user == null) {
            throw new NotFoundException("User cannot found with id: " + userId);
        }

        List<String> notificationIds = userNotificationRepository.getByUserId(userId)
                .stream().map(UserNotification::getNotificationId)
                .toList();

        return notificationRepo.findByIdInAndIsActiveTrueAndIsDeletedFalse(notificationIds, pageable)
                .map(mapper::convertToDTO);
    }

}
