package app.sportcenter.models.dto;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.FieldStatus;
import app.sportcenter.commons.FieldType;
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
    private FieldType fieldType;
    private String fieldName;
    private String description;
    private Double price;
    private String imageUrl;

    // danh sách trạng thái theo khung giờ
    private List<TimeSlot> timeSlots;
}
