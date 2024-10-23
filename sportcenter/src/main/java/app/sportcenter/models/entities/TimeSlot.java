package app.sportcenter.models.entities;

import app.sportcenter.commons.FieldStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class TimeSlot {
    private ZonedDateTime startTime;    // Thời gian bắt đầu
    private ZonedDateTime endTime;      // Thời gian kết thúc
    private FieldStatus status;         // Trạng thái: AVAILABLE, IN_USE, ...
}

// TimeSlot:
// trạng thái sân tại 1 khoảng thời gian cụ thể
// (ví dụ 6:00 -23:00 có thể chia làm 17 timeSlot, mỗi cái 1h)
// hoặc cũng có thể là 1 timeSlot dài 17 giờ