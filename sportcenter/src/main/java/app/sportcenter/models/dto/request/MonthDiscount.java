package app.sportcenter.models.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthDiscount {

    @NotNull(message = "Month must not be null")
    @Min(value = 1, message = "Month must be between 1 and 12")
    @Max(value = 12, message = "Month must be between 1 and 12")
    private Integer month;

    @NotNull(message = "Discount must not be null")
    @DecimalMin(value = "0.0", inclusive = true, message = "Discount must be ≥ 0")
    @DecimalMax(value = "100.0", inclusive = true, message = "Discount must be ≤ 100")
    private Double discount;
}

