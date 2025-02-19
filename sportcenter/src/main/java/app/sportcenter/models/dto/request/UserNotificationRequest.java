package app.sportcenter.models.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class UserNotificationRequest extends BaseRequestDTO {
    @NotNull(message = "User id must be not null!")
    private String userId;

    @NotNull(message = "Notification id must be not null!")
    private String notificationId;

}
