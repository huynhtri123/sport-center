package app.sportcenter.models.entities;

import app.sportcenter.commons.FieldStatus;
import app.sportcenter.commons.PricedItem;
import app.sportcenter.commons.RecurringIntervalType;
import app.sportcenter.exceptions.CustomException;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "recurrings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@Builder
public class RecurringBooking extends BaseEntity implements PricedItem {
    @Id
    private String id;
    private Field field;
    private User user;                         // người đặt sân
    private ZonedDateTime startDate;           // ngày bắt đầu lịch định kỳ
    private ZonedDateTime startTime;           // giờ bắt đầu trong mỗi ngày đặt
    private ZonedDateTime endTime;
    private RecurringIntervalType interval;    // loại lặp lại (WEEKLY)
    private Integer numberOfHours;             // Số giờ đặt mỗi lần đặt (để tính endTime mỗi lần đặt)
    private Integer packageDurationMonths;     // Số tháng của gói (1, 3, 6, ...)
    private List<String> bookingIds = new ArrayList<>();
    private boolean isProcessing;
    private Double totalPrice = 0.0;
    private List<TimeSlot> timeSlots;

    // tính giờ kết thúc của mỗi lần đặt
    public ZonedDateTime getEndTime() {
        return this.startTime.plusHours(numberOfHours);
    }

    // tìm tất cả timeSlot sẽ chiếm
    public List<TimeSlot> generateTimeSlots() {
        List<TimeSlot> timeSlots = new ArrayList<>();
        ZonedDateTime currentDate = startDate;

        // tổng số lần đặt
        int occurrences = switch (interval) {
            case WEEKLY -> packageDurationMonths * 4;  // 4 tuần/tháng
            case BIWEEKLY -> packageDurationMonths * 2; // 2 tuần/tháng
            default -> throw new CustomException("Invalid interval type", 400);
        };

        for (int i = 0; i < occurrences; i++) {
            ZonedDateTime slotStartTime = currentDate.withHour(startTime.getHour()).withMinute(startTime.getMinute());
            ZonedDateTime slotEndTime = slotStartTime.plusHours(numberOfHours);

            timeSlots.add(new TimeSlot(slotStartTime, slotEndTime, FieldStatus.IN_USE));

            // cập nhật currentDate theo loại chu kỳ
            switch (interval) {
                case WEEKLY -> currentDate = currentDate.plusWeeks(1);
                case BIWEEKLY -> currentDate = currentDate.plusWeeks(2);
            }
        }

        return timeSlots;
    }

    @Override
    public Double getPrice() {
        ZonedDateTime startTimeVietnam = this.startTime;
        int day = startTimeVietnam.getDayOfWeek().getValue();
        long occurrences = generateTimeSlots().size();     // số lần đặt
        return field.getPriceForDay(day) * numberOfHours * occurrences;
    }

}
