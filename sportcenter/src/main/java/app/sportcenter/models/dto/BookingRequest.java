package app.sportcenter.models.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class BookingRequest extends BaseRequestDTO {
    @NotBlank(message = "Bạn chưa nhập id người đặt sân!")
    private String userId;

    @NotBlank(message = "Bạn chưa nhập id sân!")
    private String fieldId;

    @NotNull(message = "Bạn chưa chọn thời gian bắt đầu tính giờ!")
    private ZonedDateTime startTime;

    @NotNull(message = "Bạn chưa nhập số giờ đặt sân!")
    @Positive(message = "Số giờ đặt sân phải là số dương!")
    private Integer numberOfHours;
}
