package app.sportcenter.models.dto.response;

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
    private String userFullName;
    private String userPhoneNumber;
    private ZonedDateTime bookingDate;          // Ngày đặt sân
    private Integer numberOfHours;              // Số giờ đặt sân
    private ZonedDateTime startTime;            // Thời gian bắt đầu tính giờ
    private ZonedDateTime endTime;              // Thời gian kết thúc
    private Double totalPrice;                  // Giá tiền tổng cộng (số giờ * giá sân)
    private boolean isRecurring;
    private String recurringId;
}
