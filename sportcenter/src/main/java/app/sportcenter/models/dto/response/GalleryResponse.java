package app.sportcenter.models.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class GalleryResponse extends BaseResponseDTO {
    private Double order;
    private String url;
}
