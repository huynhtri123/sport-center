package app.sportcenter.models.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Future;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchesRequest {

    @NotNull(message = "Tournament id cannot be null")
    private String tournamentId;

    @NotNull(message = "Field cannot be null")
    private String fieldId;

    @NotNull(message = "First start time cannot be null")
    @Future(message = "First start time must be in the future")
    private ZonedDateTime startTime;

    @Min(value = 1, message = "Number of hour for a match must be at least 1 minute")
    private int numberOfHours;

    @Min(value = 0, message = "Gap between matches must be at least 0 hour")
    private int gapBetweenMatches;
}
