package app.sportcenter.utils.mappers;

import app.sportcenter.models.dto.TournamentRequest;
import app.sportcenter.models.dto.TournamentResponse;
import app.sportcenter.models.entities.Tournament;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class TournamentMapper {
    @Autowired
    private ModelMapper modelMapper;

    public TournamentResponse convertToDTO(Tournament tournament) {
        return (tournament != null) ? modelMapper.map(tournament, TournamentResponse.class) : null;
    }

    public Tournament convertToEntity(TournamentRequest tournamentRequest) {
        return (tournamentRequest != null) ? modelMapper.map(tournamentRequest, Tournament.class) : null;
    }
}
