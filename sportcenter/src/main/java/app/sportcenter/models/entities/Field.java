package app.sportcenter.models.entities;

import app.sportcenter.commons.FieldStatus;
import app.sportcenter.commons.FieldType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "Field")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Field extends BaseEntity {
    @Id
    private String id;
//    private FieldType fieldType;
    @DBRef
    private Sport sport;

    private String fieldName;
    private String description;
    private String imageUrl;
    private String videoUrl;
    private Double defaultPrice = 0.0;
    private List<PricePolicy> pricePolicies;

    /* demo pricePolicies:
    [
      {
        "id": "1",
        "fieldId": "f1",
        "price": 500000,
        "daysOfWeek": [1, 2, 3, 4, 5]
      },
      {
        "id": "2",
        "fieldId": "f1",
        "price": 700000,
        "daysOfWeek": [6, 7]
      }
    ]
    */

    public Double getPriceForDay(int dayOfWeek) {
        return pricePolicies.stream()
                .filter(policy -> policy.getDaysOfWeek().contains(dayOfWeek))
                .map(PricePolicy::getPrice)
                .findFirst()
                .orElse(defaultPrice);
    }

    // danh sách trạng thái theo khung giờ
    private List<TimeSlot> timeSlots;

    public void createTimeSlots(ZonedDateTime startOfDay, ZonedDateTime endOfDay) {
        this.timeSlots = new ArrayList<>();

        // tạo khung giờ từ startOfDay đến endOfDay, mỗi khung là 1 giờ
        ZonedDateTime current = startOfDay;
        while (current.isBefore(endOfDay)) {
            // Thiết lập thời gian bắt đầu và kết thúc cho khung giờ
            ZonedDateTime next = current.plusHours(1);

            // Tạo một TimeSlot mới và đặt trạng thái mặc định là AVAILABLE
            TimeSlot slot = new TimeSlot();
            slot.setStartTime(current);
            slot.setEndTime(next);
            slot.setStatus(FieldStatus.AVAILABLE);

            // Thêm khung giờ vào danh sách
            this.timeSlots.add(slot);

            current = next;
        }
    }

    // hàm cập nhật trạng thái cho timeSlots cho mảng bookings đầu vào
    public void updateTimeSlotsStatus(List<Booking> bookings) {

        // đầu tiên ktra xem cái nào hết hạn thì reset trạng thái
        for (TimeSlot slot : this.timeSlots) {
            // Nếu thời gian kết thúc của slot đã qua, set về AVAILABLE
            if (slot.getEndTime().isBefore(ZonedDateTime.now())) {
                slot.setStatus(FieldStatus.AVAILABLE);
            }
        }

        // duyệt từng booking, ktra xem có timeSlot nào còn hạn thì đổi trạng thái thành IN_USE
        for (Booking booking : bookings) {
            ZonedDateTime start = booking.getStartTime();
            ZonedDateTime end = booking.getEndTime();

            // vì nếu bookingEnd>now thì cái này hết hạn rồi (trong quá khứ rồi),
            // và nếu bị huỷ thì isActive=false -> không cập nhật thành IN_USE
            if (end.isAfter(ZonedDateTime.now()) || !booking.getIsActive()) {
                for (TimeSlot slot : this.timeSlots) {
                    // các slot còn hạn sử dụng (còn trong khoảng tgian booking)
                    if (slot.getStartTime().isBefore(end) && slot.getEndTime().isAfter(start)) {
                        slot.setStatus(FieldStatus.IN_USE);
                    }
                }
            }
        }
    }

}
