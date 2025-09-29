package app.sportcenter.models.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchResultRequest {

    private String matchId;

    @NotNull(message = "Score A is required.")
    @Min(value = 0, message = "Score A must be a non-negative integer.")
    private Integer scoreA;

    @NotNull(message = "Score B is required.")
    @Min(value = 0, message = "Score B must be a non-negative integer.")
    private Integer scoreB;

}
