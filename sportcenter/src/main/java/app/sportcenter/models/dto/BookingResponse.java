package app.sportcenter.models.dto;

import app.sportcenter.models.entities.Field;
import app.sportcenter.models.entities.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class BookingResponse extends BaseResponseDTO {
    private String id;
    private FieldResponse fieldResponse;
    private String userId;                      // ID người dùng
    private String userName;                    // Tên người dùng
    private ZonedDateTime bookingDate;          // Ngày đặt sân
    private Integer numberOfHours;              // Số giờ đặt sân
    private ZonedDateTime startTime;            // Thời gian bắt đầu tính giờ
    private ZonedDateTime endTime;              // Thời gian kết thúc
    private Double totalPrice;                  // Giá tiền tổng cộng (số giờ * giá sân)
}
