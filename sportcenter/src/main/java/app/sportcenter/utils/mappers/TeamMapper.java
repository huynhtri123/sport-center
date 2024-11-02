package app.sportcenter.utils.mappers;

import app.sportcenter.models.dto.TeamRequest;
import app.sportcenter.models.dto.TeamResponse;
import app.sportcenter.models.entities.Team;
import app.sportcenter.models.entities.Tournament;
import app.sportcenter.repositories.TournamentRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class TeamMapper {
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private TournamentRepository tournamentRepository;

    private Tournament fetchTournamentById(String tournamentId) {
        Optional<Tournament> tournamentOpt = tournamentRepository.findById(tournamentId);
        return tournamentOpt.orElse(null);
    }

    public TeamResponse convertToDTO(Team team) {
        if (team == null) {
            return null;
        }

        TeamResponse teamResponse = modelMapper.map(team, TeamResponse.class);

        // Chuyển đổi danh sách Tournament từ team
        List<Tournament> tournaments = team.getEnrolledTournamentIds().stream()
                .map(this::fetchTournamentById)
                .collect(Collectors.toList());

        teamResponse.setEnrolledTournaments(tournaments);

        return teamResponse;
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
