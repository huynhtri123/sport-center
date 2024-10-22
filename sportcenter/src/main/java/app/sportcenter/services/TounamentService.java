package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.TounamentRequest;
import org.springframework.http.ResponseEntity;

public interface TounamentService {
    public ResponseEntity<BaseResponse> create(TounamentRequest tounamentRequest);
    public ResponseEntity<BaseResponse> getById(String id);

    public ResponseEntity<BaseResponse> update(String id, TounamentRequest tounamentRequest);
    public ResponseEntity<BaseResponse> delete(String id);
    public ResponseEntity<BaseResponse> getAll();

    public ResponseEntity<BaseResponse> restore(String id);

}
