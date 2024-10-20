package app.sportcenter.models.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class NotificationRequest extends BaseRequestDTO {
    @NotBlank(message = "Bạn chưa nhập id người nhận thông báo!")
    private String userId;          // id người nhận thông báo

    @NotBlank(message = "Bạn chưa nhập tiêu đề cho thông báo!")
    private String title;           // tiêu đề thông báo

    @NotBlank(message = "Bạn chưa nhập nội dung cho thông báo!")
    private String content;         // nội dung thông báo
}
