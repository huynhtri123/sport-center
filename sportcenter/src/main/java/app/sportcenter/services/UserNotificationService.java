package app.sportcenter.services;

import app.sportcenter.models.dto.request.UserNotificationRequest;
import app.sportcenter.models.dto.response.UserNotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserNotificationService {

    public UserNotificationResponse create(UserNotificationRequest request);

    public UserNotificationResponse getById(String id);

    public Page<UserNotificationResponse> getAllActive(Pageable pageable);

    public Page<UserNotificationResponse> getAllByUserId(String userId, Pageable pageable);

    public List<UserNotificationResponse> setAllToIsRead(String userId);
}
