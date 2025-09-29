package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.request.TeamRequest;
import app.sportcenter.models.dto.response.TeamResponse;
import app.sportcenter.models.entities.Prize;
import org.springframework.http.ResponseEntity;

public interface TeamService {
    public TeamResponse create(TeamRequest teamRequest);
    public TeamResponse temporaryCreate(TeamRequest teamRequest);

    public TeamResponse getById(String id);
    public ResponseEntity<BaseResponse> getAll();
    public ResponseEntity<BaseResponse> myTeams(String userId);

    public TeamResponse update(String id,TeamRequest teamRequest);
    public ResponseEntity<BaseResponse> softDelete(String id);
    public ResponseEntity<BaseResponse> restore(String id);

    public ResponseEntity<BaseResponse> forceDelete(String id);

    public boolean checkExistedTeam(String teamName);

    public TeamResponse award(String teamId, String tournamentId, Prize prize);
}
