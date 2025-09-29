package app.sportcenter.models.dto.response;

import app.sportcenter.models.entities.TimeSlot;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class FieldResponse extends BaseResponseDTO {
    private String id;
//    private FieldType fieldType;
    private String sportId;
    private String fieldName;
    private String description;
    private Double defaultPrice;
    private String imageUrl;
    private String videoUrl;
    private List<PricePolicyResponse> pricePolicies;

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
