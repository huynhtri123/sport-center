package app.sportcenter.models.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class FieldRequest extends BaseRequestDTO {

    @NotBlank(message = "Sport ID for the field is required!")
    private String sportId;

    @NotBlank(message = "Field name is required!")
    private String fieldName;

    @NotBlank(message = "Field description is required!")
    private String description;

    @NotBlank(message = "Image URL for the field is required!")
    private String imageUrl;

    private String videoUrl;

    @Valid
    @NotNull(message = "Price policy list is required!")
    private List<PricePolicyRequest> pricePolicies;
}

