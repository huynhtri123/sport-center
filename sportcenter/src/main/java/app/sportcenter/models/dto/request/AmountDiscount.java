package app.sportcenter.models.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AmountDiscount {

    @NotNull(message = "Threshold must not be null")
    @DecimalMin(value = "0.0", inclusive = true, message = "Threshold must be ≥ 0")
    @DecimalMax(value = "100.0", inclusive = true, message = "Threshold must be ≤ 100")
    private Double threshold;

    @NotNull(message = "Discount must not be null")
    @DecimalMin(value = "0.0", inclusive = true, message = "Discount must be ≥ 0")
    @DecimalMax(value = "100.0", inclusive = true, message = "Discount must be ≤ 100")
    private Double discount;
}
