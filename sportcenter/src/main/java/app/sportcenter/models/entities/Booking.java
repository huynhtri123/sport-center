package app.sportcenter.models.entities;

import app.sportcenter.commons.PricedItem;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.ZonedDateTime;

@Document(collection = "Booking")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class Booking extends BaseEntity implements PricedItem {
    @Id
    private String id;
    private Field field;
    private User user;                      // người đặt sân
    private ZonedDateTime bookingDate;      // ngày đặt sân
    private Integer numberOfHours;          // số giờ đặt sân
    private ZonedDateTime startTime;        // thời gian bắt đầu tính giờ
    private ZonedDateTime endTime;          // thời gian trả sân

    @Override
    public Double getPrice() {
        return this.field.getPrice() * numberOfHours;
    }

    // tính thời gian kết thúc dựa trên số giờ đặt
    public void calculateEndTime() {
        this.endTime = startTime.plusHours(numberOfHours);
    }
}
