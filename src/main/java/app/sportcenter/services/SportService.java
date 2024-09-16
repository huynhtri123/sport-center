package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.SportRequestDTO;
import app.sportcenter.models.entities.Sport;
import org.springframework.http.ResponseEntity;

public interface SportService {
    public ResponseEntity<BaseResponse> create(SportRequestDTO sportRequestDTO);
}
