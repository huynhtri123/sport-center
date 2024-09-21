package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.SportRequest;
import org.springframework.http.ResponseEntity;

public interface SportService {
    public ResponseEntity<BaseResponse> create(SportRequest sportRequest);
}
