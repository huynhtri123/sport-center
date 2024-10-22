package app.sportcenter.utils.mappers;

import app.sportcenter.models.dto.TounamentRequest;
import app.sportcenter.models.dto.TounamentResponse;
import app.sportcenter.models.entities.Tounament;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class TounamentMapper {
    @Autowired
    private ModelMapper modelMapper;

    public TounamentResponse convertToDTO(Tounament tounament) {
        return (tounament != null) ? modelMapper.map(tounament, TounamentResponse.class) : null;
    }

    public Tounament convertToEntity(TounamentRequest tounamentRequest) {
        return (tounamentRequest != null) ? modelMapper.map(tounamentRequest, Tounament.class) : null;
    }
}
