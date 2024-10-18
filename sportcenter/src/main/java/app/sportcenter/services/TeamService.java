package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.TeamRequest;
import app.sportcenter.models.entities.Team;
import org.springframework.http.ResponseEntity;

public interface TeamService {
    public ResponseEntity<BaseResponse> create(TeamRequest teamRequest);
}
