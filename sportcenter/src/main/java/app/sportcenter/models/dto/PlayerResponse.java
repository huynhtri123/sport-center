package app.sportcenter.models.dto;

import app.sportcenter.commons.BaseResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerResponse extends BaseResponseDTO {
    private String name;
    private String position;
    private Integer number;
}
