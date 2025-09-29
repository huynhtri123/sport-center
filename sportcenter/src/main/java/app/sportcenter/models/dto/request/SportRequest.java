package app.sportcenter.models.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class SportRequest extends BaseRequestDTO {
    @NotBlank(message = "Sport name is required.")
    private String sportName;

    @NotBlank(message = "Sport description is required.")
    private String description;

    @NotBlank(message = "Image URL for the sport is required.")
    private String imageUrl;
}

