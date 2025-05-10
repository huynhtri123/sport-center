package app.sportcenter.models.dto.request;

import app.sportcenter.commons.RecurringIntervalType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.ZonedDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class RecurringBookingRequest extends BaseRequestDTO {

    @NotNull(message = "Field is required.")
    private String fieldId;

    @NotNull(message = "Start date of the recurring cycle is required.")
    private ZonedDateTime startDate;           // Ngày bắt đầu lịch định kỳ

    @NotNull(message = "Start time for each booking day is required.")
    private ZonedDateTime startTime;           // Giờ bắt đầu mỗi lần đặt

    @NotNull(message = "Recurring interval type (daily/weekly/monthly) is required.")
    private RecurringIntervalType interval;    // Loại lặp lại (DAILY, WEEKLY, MONTHLY)

    @NotNull(message = "Booking duration per session is required.")
    @Positive(message = "Booking duration must be a positive number.")
    private Integer numberOfHours;             // Số giờ đặt mỗi lần

    @NotNull(message = "Package duration is required.")
    @Positive(message = "Package duration must be a positive number.")
    private Integer packageDurationMonths;     // Số tháng của gói (1, 3, 6, ...)
}
