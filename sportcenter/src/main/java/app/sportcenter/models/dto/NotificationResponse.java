package app.sportcenter.models.dto;


import app.sportcenter.models.entities.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class NotificationResponse extends BaseResponseDTO{
    private String id;
    private User user;          // người nhận thông báo
    private String title;       // tiêu đề thông báo
    private String content;     // nội dung thông báo
}
