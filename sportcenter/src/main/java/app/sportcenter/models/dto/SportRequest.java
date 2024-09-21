package app.sportcenter.models.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class SportRequest extends BaseRequestDTO {
    @NotBlank(message = "Bạn chưa nhập tên cho môn thể thao!")
    private String sportName;
    @NotBlank(message = "Bạn chưa nhập mô tả cho môn thể thao!")
    private String description;
    @NotBlank(message = "Bạn chưa nhập link ảnh cho môn thể thao!")
    private String imageUrl;
}
