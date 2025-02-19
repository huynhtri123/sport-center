package app.sportcenter.services.impl;

import app.sportcenter.exceptions.CustomException;
import app.sportcenter.exceptions.NotFoundException;
import app.sportcenter.models.dto.response.NotificationResponse;
import app.sportcenter.models.dto.request.UserNotificationRequest;
import app.sportcenter.models.dto.response.UserNotificationResponse;
import app.sportcenter.models.dto.response.UserResponse;
import app.sportcenter.models.entities.UserNotification;
import app.sportcenter.repositories.UserNotificationRepository;
import app.sportcenter.services.NotificationService;
import app.sportcenter.services.UserNotificationService;
import app.sportcenter.services.UserService;
import app.sportcenter.utils.mappers.UserNotificationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserNotificationServiceImpl implements UserNotificationService {

    private final UserNotificationRepository repository;
    private final UserNotificationMapper mapper;
    private final UserService userService;
    private final NotificationService notificationService;

    @Override
    public UserNotificationResponse create(UserNotificationRequest request) {
        String userId = request.getUserId();
        UserResponse user = userService.getUserById(userId);
        if (user == null) {
            throw new NotFoundException("User cannot found with id: "+ userId);
        }
        String notificationId = request.getNotificationId();
        NotificationResponse notificationResponse = notificationService.getById(notificationId);
        if (notificationResponse == null) {
            throw new NotFoundException("Notification cannot found with id: "+ notificationId);
        }

        boolean exists = repository.existsByUserIdAndNotificationId(userId, notificationId);
        if (exists) {
            throw new CustomException("Notification already exists for this user.", 409);
        }

        UserNotification userNotification = mapper.convertToEntity(request);
        return mapper.convertToResponse(repository.save(userNotification));
    }

    @Override
    public UserNotificationResponse getById(String id) {
        return mapper.convertToResponse(
                repository.findById(id)
                        .orElseThrow(() -> new NotFoundException("User Notification cannot found with id: " + id))
        );
    }

    @Override
    public Page<UserNotificationResponse> getAllActive(Pageable pageable) {
        return repository.getByIsActiveTrueAndIsDeletedFalse(pageable)
                .map(mapper::convertToResponse);
    }

    @Override
    public Page<UserNotificationResponse> getAllByUserId(String userId, Pageable pageable) {
        UserResponse user = userService.getUserById(userId);
        if (user == null) {
            throw new NotFoundException("User cannot found with id: "+ userId);
        }

        return repository.getByUserId(userId, pageable)
                .map(mapper::convertToResponse);
    }

    @Override
    public List<UserNotificationResponse> setAllToIsRead(String userId) {
        List<UserNotification> userNotifications = repository.getByUserId(userId);
        List<UserNotification> unreadNotifications = userNotifications.stream()
                .filter(u -> !u.isRead())
                .peek(u -> {
                    u.setRead(true);
                    u.setReadAt(ZonedDateTime.now());
                })
                .toList();

        if (!unreadNotifications.isEmpty()) {
            repository.saveAll(unreadNotifications);
        }

        return unreadNotifications.stream().map(mapper::convertToResponse).toList();
    }

}
