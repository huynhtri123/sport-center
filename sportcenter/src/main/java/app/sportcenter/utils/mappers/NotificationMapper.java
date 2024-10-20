package app.sportcenter.utils.mappers;

import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.NotificationRequest;
import app.sportcenter.models.dto.NotificationResponse;
import app.sportcenter.models.entities.Notification;
import app.sportcenter.models.entities.User;
import app.sportcenter.repositories.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private UserRepository userRepository;

    public Notification convertToEntity(NotificationRequest notificationRequest) {
        if (notificationRequest == null) {
            return null;
        }

        Notification notification = modelMapper.map(notificationRequest, Notification.class);

        // Tìm User dựa trên userId
        User user = userRepository.findById(notificationRequest.getUserId())
                .orElseThrow(() -> new CustomException("Người nhận không tồn tại", HttpStatus.NOT_FOUND.value()));

        notification.setUser(user); // Đặt User vào Notification
        return notification;
    }

    public NotificationResponse convertToDTO(Notification notification) {
        return notification != null ? modelMapper.map(notification, NotificationResponse.class) : null;
    }
}
