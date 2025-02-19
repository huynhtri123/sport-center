package app.sportcenter.utils.mappers;

import app.sportcenter.models.dto.request.UserNotificationRequest;
import app.sportcenter.models.dto.response.UserNotificationResponse;
import app.sportcenter.models.entities.UserNotification;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserNotificationMapper {
    private final ModelMapper mapper;

    public UserNotification convertToEntity(UserNotificationRequest userNotificationRequest) {
        return mapper.map(userNotificationRequest, UserNotification.class);
    }

    public UserNotificationResponse convertToResponse(UserNotification userNotification) {
        return mapper.map(userNotification, UserNotificationResponse.class);
    }
}
