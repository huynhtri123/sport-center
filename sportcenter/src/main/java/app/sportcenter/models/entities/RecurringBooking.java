package app.sportcenter.models.entities;

import app.sportcenter.commons.FieldStatus;
import app.sportcenter.commons.PricedItem;
import app.sportcenter.commons.RecurringIntervalType;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "RecurringBooking")
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
    private RecurringIntervalType interval;    // loại lặp lại (DAILY, WEEKLY, MONTHLY)
    private Integer numberOfHours;             // Số giờ đặt mỗi lần đặt (để tính endTime mỗi lần đặt)
    private Integer packageDurationMonths;       // Số tháng của gói (1, 3, 6, ...)
    private List<String> bookingIds = new ArrayList<>();
    private boolean isProcessing;

    // tính giờ kết thúc của mỗi lần đặt
    public ZonedDateTime getEndTime() {
        return this.startTime.plusHours(numberOfHours);
    }

    // tính ngày kết thúc của gói dựa trên packageDurationMonths
    public ZonedDateTime getEndDate() {
        if (packageDurationMonths != null && packageDurationMonths > 0) {
            return startDate.plusMonths(packageDurationMonths);
        }
        throw new IllegalArgumentException("Package duration must be greater than 0");
    }

    // tính các ngày đặt trong chu kỳ
//    public List<ZonedDateTime> generateRecurringDates() {
//        List<ZonedDateTime> recurringDates = new ArrayList<>();
//        ZonedDateTime currentDate = startDate;
//        ZonedDateTime calculatedEndDate = getEndDate();
//
//        while (currentDate.isBefore(calculatedEndDate) || currentDate.isEqual(calculatedEndDate)) {
//            recurringDates.add(currentDate);
//
//            // cập nhật ngày theo loại chu kỳ
//            switch (interval) {
//                case DAILY:
//                    currentDate = currentDate.plusDays(1);
//                    break;
//                case WEEKLY:
//                    currentDate = currentDate.plusWeeks(1);
//                    break;
//                case MONTHLY:
//                    currentDate = currentDate.plusMonths(1);
//                    break;
//                default:
//                    throw new IllegalArgumentException("Invalid interval type");
//            }
//        }
//        return recurringDates;
//    }

    // tìm tất cả timeSlot sẽ chiếm
    public List<TimeSlot> generateTimeSlots() {
        List<TimeSlot> timeSlots = new ArrayList<>();
        ZonedDateTime currentDate = startDate;
        ZonedDateTime calculatedEndDate = getEndDate();

        while (currentDate.isBefore(calculatedEndDate) || currentDate.isEqual(calculatedEndDate)) {
            // Thiết lập startTime và endTime cho timeSlot hiện tại
            ZonedDateTime slotStartTime = currentDate.withHour(startTime.getHour()).withMinute(startTime.getMinute());
            ZonedDateTime slotEndTime = slotStartTime.plusHours(numberOfHours);

            // Thêm timeSlot vào danh sách
            timeSlots.add(new TimeSlot(slotStartTime, slotEndTime, FieldStatus.IN_USE));

            // Cập nhật currentDate theo loại chu kỳ
            switch (interval) {
                case DAILY:
                    currentDate = currentDate.plusDays(1);
                    break;
                case WEEKLY:
                    currentDate = currentDate.plusWeeks(1);
                    break;
                case MONTHLY:
                    currentDate = currentDate.plusMonths(1);
                    break;
                default:
                    throw new IllegalArgumentException("Invalid interval type");
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
