package app.sportcenter.utils.mappers;

import app.sportcenter.models.dto.SportRequest;
import app.sportcenter.models.dto.SportResponse;
import app.sportcenter.models.entities.Sport;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SportMapper {
    @Autowired
    private ModelMapper modelMapper;
    public SportResponse convertToDTO(Sport sport) {
        return (sport != null) ? modelMapper.map(sport, SportResponse.class) : null;
    }
    public Sport convetToEntity(SportRequest sportRequest) {
        return (sportRequest != null) ? modelMapper.map(sportRequest, Sport.class) : null;
    }
}
