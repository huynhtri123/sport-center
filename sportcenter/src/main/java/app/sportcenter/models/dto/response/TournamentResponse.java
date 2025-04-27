package app.sportcenter.models.dto.response;

import app.sportcenter.models.entities.Prize;
import app.sportcenter.models.entities.Sport;
import app.sportcenter.models.entities.StandingsEntry;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TournamentResponse extends BaseResponseDTO {
    private String id;
    private Sport sport;
    private String tournamentName;
    private ZonedDateTime startDate;
    //private ZonedDateTime endDate;
    private Integer maxTeams;
    private List<String> registeredTeamIds;
    private ZonedDateTime registrationDeadline;
    private List<Prize> prizes;
    private String thumUrl;
    private Double registrationFee;
    private List<String> rules;

    private List<StandingsEntry> standings = new ArrayList<>(); // bxh cho moi doi
    private List<String> advancingTeams;    // danh sách đội đi tiếp

    private boolean isDone;
    private String winnerTeamId;
}
