package app.sportcenter.models.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class PricePolicyRequest extends BaseRequestDTO {
    private String id; // dùng cho cập nhật

    @NotNull(message = "Bạn chưa nhập giá cho chính sách giá!")
    private Double price;

    @NotNull(message = "Bạn chưa nhập danh sách ngày áp dụng!")
    private List<Integer> daysOfWeek;
}
