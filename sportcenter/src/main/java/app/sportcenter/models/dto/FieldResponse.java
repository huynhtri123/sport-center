package app.sportcenter.models.dto;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.FieldStatus;
import app.sportcenter.commons.FieldType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class FieldResponse extends BaseResponseDTO {
    private String id;
    private FieldType fieldType;
    private FieldStatus fieldStatus;
    private String fieldName;
    private String description;
    private Double price;
    private String imageUrl;
}
