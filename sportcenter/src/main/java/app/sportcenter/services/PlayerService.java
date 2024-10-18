package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.PlayerRequest;
import org.springframework.http.ResponseEntity;

public interface PlayerService {
    public ResponseEntity<BaseResponse> create(PlayerRequest playerRequest);
    public ResponseEntity<BaseResponse> getById(String id);
    public ResponseEntity<BaseResponse> update(String id, PlayerRequest playerRequest);
    public ResponseEntity<BaseResponse> delete(String id);
    public ResponseEntity<BaseResponse> getAll();
    public ResponseEntity<BaseResponse> restore(String id);
}
