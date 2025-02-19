package app.sportcenter.utils.mappers;

import app.sportcenter.models.dto.request.TeamRequest;
import app.sportcenter.models.dto.response.TeamResponse;
import app.sportcenter.models.entities.Team;
import app.sportcenter.models.entities.Tournament;
import app.sportcenter.repositories.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class TeamMapper {
    private final ModelMapper modelMapper;
    private final TournamentRepository tournamentRepository;

    private Tournament fetchTournamentById(String tournamentId) {
        Optional<Tournament> tournamentOpt = tournamentRepository.findById(tournamentId);
        return tournamentOpt.orElse(null);
    }

    public TeamResponse convertToDTO(Team team) {
        if (team == null) {
            return null;
        }

        TeamResponse teamResponse = modelMapper.map(team, TeamResponse.class);

        // Kiểm tra trường hợp getEnrolledTournamentIds là null
        List<Tournament> tournaments = new ArrayList<>();
        if (team.getEnrolledTournamentIds() != null) {
            tournaments = team.getEnrolledTournamentIds().stream()
                    .map(this::fetchTournamentById)
                    .collect(Collectors.toList());
        }

        teamResponse.setEnrolledTournaments(tournaments);

        return teamResponse;
    }

    public Team convertToEntity(TeamRequest teamRequest, String userId) {
        if (teamRequest == null) {
            return null;
        }
        return Team.builder()
                .userId(userId)
                .teamName(teamRequest.getTeamName())
                .players(teamRequest.getPlayers())
                .teamLogoUrl(teamRequest.getTeamLogoUrl())
                .build();
    }

    public Team updateEntityFromRequest(TeamRequest teamRequest, Team team) {
        if (teamRequest != null && team != null) {
            team.setTeamName(teamRequest.getTeamName());
            team.setPlayers(teamRequest.getPlayers());
            team.setTeamLogoUrl(teamRequest.getTeamLogoUrl());
            return team;
        }
        return null;
    }
}
