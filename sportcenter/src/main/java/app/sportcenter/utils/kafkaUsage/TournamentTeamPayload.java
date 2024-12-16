package app.sportcenter.utils.kafkaUsage;

import app.sportcenter.models.dto.TeamResponse;
import app.sportcenter.models.dto.TournamentResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TournamentTeamPayload {
    private TournamentResponse tournament;
    private TeamResponse team;
}
