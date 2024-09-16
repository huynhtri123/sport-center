package app.sportcenter.models.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SportResponseDTO extends BaseResponseDTO{
    private String sportName;
    private String description;
    private String imageUrl;
}
