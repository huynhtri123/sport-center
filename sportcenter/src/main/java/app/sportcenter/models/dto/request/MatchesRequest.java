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

    @NotNull(message = "Tournament ID cannot be null")
    private String tournamentId;

    @NotNull(message = "First start time cannot be null")
    @Future(message = "First start time must be in the future")
    private ZonedDateTime firstStartTime;

    @NotNull(message = "First end time cannot be null")
    @Future(message = "First end time must be in the future")
    private ZonedDateTime firstEndTime;

    @Min(value = 1, message = "Gap between matches must be at least 1 minute")
    private int gapBetweenMatches;
}
