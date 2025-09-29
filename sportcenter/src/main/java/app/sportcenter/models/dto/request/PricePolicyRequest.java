package app.sportcenter.models.dto.request;

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
public class PricePolicyRequest extends BaseRequestDTO {
    private String id; // used for update

    @NotNull(message = "Price for the pricing policy is required.")
    private Double price;

    @NotNull(message = "List of applicable days is required.")
    private List<Integer> daysOfWeek;
}
