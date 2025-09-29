package app.sportcenter.models.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class NotificationRequest extends BaseRequestDTO {

    @NotBlank(message = "You do not enter title for message!")
    @Size(min = 0, max = 100, message = "Title must between 0 and 100 characters!")
    private String title;

    @NotBlank(message = "You have not entered content for the notification!")
    @Size(min = 0, max = 255, message = "Content must between 0 and 255 characters!")
    private String content;

    private String imageUrl;
}
