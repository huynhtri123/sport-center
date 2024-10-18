package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.TeamRequest;
import app.sportcenter.models.entities.Team;
import org.springframework.http.ResponseEntity;

public interface TeamService {
    public ResponseEntity<BaseResponse> create(TeamRequest teamRequest);
    public ResponseEntity<BaseResponse> getById(String id);

    public ResponseEntity<BaseResponse> update(String id,TeamRequest teamRequest);
    public ResponseEntity<BaseResponse> delete(String id);
    public ResponseEntity<BaseResponse> getAll();
    public ResponseEntity<BaseResponse> restore(String id);
}
