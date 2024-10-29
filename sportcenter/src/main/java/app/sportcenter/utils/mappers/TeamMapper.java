package app.sportcenter.utils.mappers;

import app.sportcenter.models.dto.TeamRequest;
import app.sportcenter.models.dto.TeamResponse;
import app.sportcenter.models.entities.Team;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class TeamMapper {
    @Autowired
    private ModelMapper modelMapper;
    public TeamResponse convertToDTO(Team team) {
        return (team != null) ? modelMapper.map(team, TeamResponse.class) : null;
    }
    public Team convertToEntity(TeamRequest teamRequest, String userId) {
        if (teamRequest == null) {
            return null;
        }
        Team team = Team.builder()
                .userId(userId)
                .teamName(teamRequest.getTeamName())
                .players(teamRequest.getPlayers())
                .enrolledTournamentIds(teamRequest.getEnrolledTournamentIds())
                .teamLogoUrl(teamRequest.getTeamLogoUrl())
                .wonPrizes(teamRequest.getWonPrizes())
                .build();
        return team;
    }

    public Team updateEntityFromRequest(TeamRequest teamRequest, Team team) {
        if (teamRequest != null && team != null) {
            team.setTeamName(teamRequest.getTeamName());
            team.setPlayers(teamRequest.getPlayers());
            team.setTeamLogoUrl(teamRequest.getTeamLogoUrl());
            team.setEnrolledTournamentIds(teamRequest.getEnrolledTournamentIds());
            team.setWonPrizes(teamRequest.getWonPrizes());
            return team;
        }
        return null;
    }
}
