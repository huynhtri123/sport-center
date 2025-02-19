package app.sportcenter.utils.mappers;

import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.request.TournamentRequest;
import app.sportcenter.models.dto.response.TournamentResponse;
import app.sportcenter.models.entities.Sport;
import app.sportcenter.models.entities.Tournament;
import app.sportcenter.repositories.SportRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;


@Component
public class TournamentMapper {
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private SportRepository sportRepository;

    public Tournament convertToEntity(TournamentRequest tournamentRequest) {
        return (tournamentRequest != null) ? modelMapper.map(tournamentRequest, Tournament.class) : null;
    }

    public TournamentResponse convertToDTO(Tournament tournament) {
        if (tournament == null) {
            throw new CustomException("Mapper không thành công vì tournament input is null", HttpStatus.BAD_REQUEST.value());
        }
        Sport sport = sportRepository.getSportById(tournament.getSportId());
        TournamentResponse response = new TournamentResponse();
        response.setId(tournament.getId());
        response.setSport(sport);
        response.setTournamentName(tournament.getTournamentName());
        response.setStartDate(tournament.getStartDate());
        response.setEndDate(tournament.getEndDate());
        response.setMaxTeams(tournament.getMaxTeams());
        response.setRegisteredTeamIds(tournament.getRegisteredTeamIds());
        response.setRegistrationDeadline(tournament.getRegistrationDeadline());
        response.setPrizes(tournament.getPrizes());
        response.setThumUrl(tournament.getThumUrl());
        response.setRegistrationFee(tournament.getRegistrationFee());
        response.setRules(tournament.getRules());

        response.setCreatedAt(tournament.getCreatedAt());
        response.setUpdatedAt(tournament.getUpdatedAt());
        response.setIsActive(tournament.getIsActive());
        response.setIsDeleted(tournament.getIsDeleted());

        return response;
    }
}
