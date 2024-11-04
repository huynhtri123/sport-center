package app.sportcenter.models.dto;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.FieldStatus;
import app.sportcenter.commons.FieldType;
import app.sportcenter.models.entities.TimeSlot;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class FieldResponse extends BaseResponseDTO {
    private String id;
    private FieldType fieldType;
    private String fieldName;
    private String description;
    private Double price;
    private String imageUrl;

    // danh sách trạng thái theo khung giờ
    private List<TimeSlot> timeSlots;
    // chuyển về giờ việt nam (+7), vì khi lưu vào db là +0
    public void convertTimeSlotsToUTCPlus7() {
        this.timeSlots.forEach(slot -> {
            slot.setStartTime(slot.getStartTime().plusHours(7));
            slot.setEndTime(slot.getEndTime().plusHours(7));
        });
    }
}
