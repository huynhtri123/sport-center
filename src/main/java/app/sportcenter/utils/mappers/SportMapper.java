package app.sportcenter.utils.mappers;

import app.sportcenter.models.dto.SportRequestDTO;
import app.sportcenter.models.dto.SportResponseDTO;
import app.sportcenter.models.entities.Sport;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SportMapper {
    @Autowired
    private ModelMapper modelMapper;
    public SportResponseDTO convertToDTO(Sport sport) {
        return (sport != null) ? modelMapper.map(sport, SportResponseDTO.class) : null;
    }
    public Sport convetToEntity(SportRequestDTO sportRequest) {
        return (sportRequest != null) ? modelMapper.map(sportRequest, Sport.class) : null;
    }
}
