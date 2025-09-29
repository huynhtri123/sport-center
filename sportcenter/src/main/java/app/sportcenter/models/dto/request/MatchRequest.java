package app.sportcenter.models.dto.request;

import app.sportcenter.commons.MatchStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchRequest {

    @NotNull(message = "Tournament ID cannot be null")
    private String tournamentId;

    @NotNull(message = "Team A ID cannot be null")
    private String teamAId;

    @NotNull(message = "Team B ID cannot be null")
    private String teamBId;

    private Integer scoreA;
    private Integer scoreB;

    @NotNull(message = "Start time cannot be null")
    @Future(message = "Start time must be in the future")
    private ZonedDateTime startTime;

    @NotNull(message = "End time cannot be null")
    @FutureOrPresent(message = "End time must be in the present or future")
    private ZonedDateTime endTime;

    @Min(value = 1, message = "Min of round is 1")
    private Integer round;

    @NotNull(message = "Match status cannot be null")
    private MatchStatus status; // UPCOMING, ONGOING, COMPLETED, CANCELED
}

