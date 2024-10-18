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
    public Team convertToEntity(TeamRequest teamRequest) {
        return (teamRequest != null) ? modelMapper.map(teamRequest, Team.class) : null;
    }
}
