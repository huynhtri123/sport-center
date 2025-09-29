package app.sportcenter.models.dto.response;

import app.sportcenter.commons.MatchStatus;
import lombok.*;

import java.time.ZonedDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class MatchResponse extends BaseResponseDTO {
    private TournamentResponse tournament;

    private TeamResponse teamA;
    private TeamResponse teamB;

    private Integer scoreA;
    private Integer scoreB;

    private ZonedDateTime startTime;
    private ZonedDateTime endTime;

    private Integer round;

    private MatchStatus status; // UPCOMING, ONGOING, COMPLETED, CANCELED
    private String winnerId;
}
