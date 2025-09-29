package app.sportcenter.models.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class NotificationResponse extends BaseResponseDTO {
    private String title;
    private String content;
    private String imageUrl;
}
