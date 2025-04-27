package app.sportcenter.utils.mappers;

import app.sportcenter.models.dto.request.MatchRequest;
import app.sportcenter.models.dto.response.MatchResponse;
import app.sportcenter.models.dto.response.TeamResponse;
import app.sportcenter.models.dto.response.TournamentResponse;
import app.sportcenter.models.entities.Match;
import app.sportcenter.models.entities.Team;
import app.sportcenter.services.TeamService;
import app.sportcenter.services.TournamentService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MatchMapper {
    private final ModelMapper modelMapper;
    private final TournamentService tournamentService;
    private final TeamService teamService;

    public MatchResponse convertToResponse(Match match) {
        MatchResponse matchResponse = modelMapper.map(match, MatchResponse.class);
        TournamentResponse tournament = tournamentService.getById(match.getTournamentId());
        TeamResponse teamA = teamService.getById(match.getTeamAId());
        TeamResponse teamB = teamService.getById(match.getTeamBId());

        matchResponse.setTournament(tournament);
        matchResponse.setTeamA(teamA);
        matchResponse.setTeamB(teamB);

        return matchResponse;
    }

    public Match convertToEntity(MatchRequest matchRequest) {
        return modelMapper.map(matchRequest, Match.class);
    }

}
