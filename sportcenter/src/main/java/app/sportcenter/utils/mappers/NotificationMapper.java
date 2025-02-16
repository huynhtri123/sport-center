package app.sportcenter.utils.mappers;

import app.sportcenter.models.dto.NotificationRequest;
import app.sportcenter.models.dto.NotificationResponse;
import app.sportcenter.models.entities.Notification;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationMapper {

    private final ModelMapper modelMapper;

    public Notification convertToEntity(NotificationRequest notificationRequest) {
        return modelMapper.map(notificationRequest, Notification.class);
    }

    public NotificationResponse convertToDTO(Notification notification) {
        return notification != null ? modelMapper.map(notification, NotificationResponse.class) : null;
    }
}
