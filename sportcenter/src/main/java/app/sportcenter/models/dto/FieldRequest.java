package app.sportcenter.models.dto;

import app.sportcenter.commons.FieldStatus;
import app.sportcenter.commons.FieldType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class FieldRequest extends BaseRequestDTO {

    // client: tạo combobox chứa các giá trị có sẵn (giá trị khác có sẵn là lỗi)
//    @NotNull(message = "Bạn chưa nhập loại sân!")
//    private FieldType fieldType;
    @NotBlank(message = "Bạn chưa nhập id môn thể thao cho sân!")
    private String sportId;

    @NotBlank(message = "Bạn chưa nhập tên cho sân!")
    private String fieldName;

    @NotBlank(message = "Bạn chưa nhập mô tả cho sân!")
    private String description;

    @NotBlank(message = "Bạn chưa nhập đường dẫn ảnh cho sân!")
    private String imageUrl;

    private String videoUrl;

    @Valid
    @NotNull(message = "Bạn chưa nhập danh sách chính sách giá!")
    private List<PricePolicyRequest> pricePolicies;
}
