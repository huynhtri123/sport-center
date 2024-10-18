package app.sportcenter.models.dto;

import app.sportcenter.commons.FieldStatus;
import app.sportcenter.commons.FieldType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class FieldRequest extends BaseRequestDTO {

    // client: tạo combobox chứa các giá trị có sẵn (giá trị khác có sẵn là lỗi)
    @NotNull(message = "Bạn chưa nhập loại sân!")
    private FieldType fieldType;

    @NotNull(message = "Bạn chưa nhập trạng thái cho sân!")
    private FieldStatus fieldStatus;

    @NotBlank(message = "Bạn chưa nhập tên cho sân!")
    private String fieldName;

    @NotBlank(message = "Bạn chưa nhập mô tả cho sân!")
    private String description;

    @NotNull(message = "Bạn chưa nhập giá cho sân!")
    private Double price;

    @NotBlank(message = "Bạn chưa nhập đường dẫn ảnh cho sân!")
    private String imageUrl;
}
