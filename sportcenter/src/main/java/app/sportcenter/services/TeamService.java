package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.TeamRequest;
import app.sportcenter.models.dto.TeamResponse;
import org.springframework.http.ResponseEntity;

public interface TeamService {
    public TeamResponse create(TeamRequest teamRequest);
    public TeamResponse temporaryCreate(TeamRequest teamRequest);

    public ResponseEntity<BaseResponse> getById(String id);
    public ResponseEntity<BaseResponse> getAll();
    public ResponseEntity<BaseResponse> myTeams(String userId);

    public TeamResponse update(String id,TeamRequest teamRequest);
    public ResponseEntity<BaseResponse> softDelete(String id);
    public ResponseEntity<BaseResponse> restore(String id);

    public ResponseEntity<BaseResponse> forceDelete(String id);

    public boolean checkExistedTeam(String teamName);
}
