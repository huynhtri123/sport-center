package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.request.SportRequest;
import org.springframework.http.ResponseEntity;

public interface SportService {

    public ResponseEntity<BaseResponse> create(SportRequest sportRequest);

    public ResponseEntity<BaseResponse> getById(String id);

    public ResponseEntity<BaseResponse> update(String id, SportRequest sportRequest);

    public ResponseEntity<BaseResponse> softDelete(String id);

    public ResponseEntity<BaseResponse> getAllActive(int page, int size);

    public ResponseEntity<BaseResponse> restore(String id);
}
