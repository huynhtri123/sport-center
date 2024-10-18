package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.FieldStatus;
import app.sportcenter.commons.FieldType;
import app.sportcenter.models.dto.FieldRequest;
import org.springframework.http.ResponseEntity;

public interface FieldService {
    public ResponseEntity<BaseResponse> create(FieldRequest fieldRequest);

    public ResponseEntity<BaseResponse> getAllActive();
    public ResponseEntity<BaseResponse> getById(String fieldId);
    public ResponseEntity<BaseResponse> getAllSoftDeleted();

    public ResponseEntity<BaseResponse> updateById(String fieldId, FieldRequest newField);
    public ResponseEntity<BaseResponse> toggleActiveStatus(String fieldId);
    public ResponseEntity<BaseResponse> changeFieldStatus(String fieldId, FieldStatus newStatus);

    public ResponseEntity<BaseResponse> softDeleted(String fieldId);
    public ResponseEntity<BaseResponse> restore(String fieldId);
    public ResponseEntity<BaseResponse> forceDelete(String fieldId);

    public ResponseEntity<BaseResponse> searchByNameContainingIgnoreCase(String fieldName);
    public ResponseEntity<BaseResponse> findByFieldType(FieldType fieldType);
    public ResponseEntity<BaseResponse> findByFieldStatus(FieldStatus fieldStatus);
}
