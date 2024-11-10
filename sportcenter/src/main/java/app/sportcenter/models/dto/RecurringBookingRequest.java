package app.sportcenter.models.dto;

import app.sportcenter.commons.RecurringIntervalType;
import app.sportcenter.models.entities.Field;
import app.sportcenter.models.entities.User;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.ZonedDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class RecurringBookingRequest extends BaseRequestDTO {

    @NotNull(message = "Bạn chưa chọn sân!")
    private String fieldId;

    @NotNull(message = "Bạn chưa chọn ngày bắt đầu chu kỳ!")
    private ZonedDateTime startDate;           // Ngày bắt đầu lịch định kỳ

    @NotNull(message = "Bạn chưa chọn thời gian bắt đầu trong mỗi ngày đặt!")
    private ZonedDateTime startTime;           // Giờ bắt đầu mỗi lần đặt

    @NotNull(message = "Bạn chưa chọn loại lặp lại (ngày/tuần/tháng)!")
    private RecurringIntervalType interval;    // Loại lặp lại (DAILY, WEEKLY, MONTHLY)

    @NotNull(message = "Số giờ đặt mỗi lần không thể bỏ trống!")
    @Positive(message = "Số giờ đặt phải là số dương!")
    private Integer numberOfHours;             // Số giờ đặt mỗi lần

    @NotNull(message = "Bạn chưa chọn thời lượng gói!")
    @Positive(message = "Thời lượng gói phải là số dương!")
    private Integer packageDurationMonths;     // Số tháng của gói (1, 3, 6, ...)
}