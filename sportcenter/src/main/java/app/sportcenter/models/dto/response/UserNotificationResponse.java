package app.sportcenter.models.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class UserNotificationResponse extends BaseResponseDTO {
    private String userId;

    private String notificationId;

    private boolean isRead;

    private ZonedDateTime readAt;
}
