package app.sportcenter.services.impl;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.FieldStatus;
import app.sportcenter.commons.FieldType;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.exceptions.NotFoundException;
import app.sportcenter.models.dto.FieldRequest;
import app.sportcenter.models.dto.FieldResponse;
import app.sportcenter.models.entities.Field;
import app.sportcenter.repositories.FieldRepository;
import app.sportcenter.services.FieldService;
import app.sportcenter.utils.mappers.FieldMapper;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FieldServiceImpl implements FieldService {

    @Autowired
    private FieldRepository fieldRepository;
    @Autowired
    private FieldMapper fieldMapper;
    @Autowired
    private ModelMapper modelMapper;

    @Override
    public ResponseEntity<BaseResponse> create(FieldRequest fieldRequest) {
        Field field = fieldMapper.convertToEntity(fieldRequest);
        if (field == null) {
            throw new CustomException("Inputs are null!", HttpStatus.BAD_REQUEST.value());
        }
        FieldResponse responseField = fieldMapper.convertToDTO(fieldRepository.save(field));
        return ResponseEntity.status(HttpStatus.CREATED.value()).body(
                new BaseResponse("Tạo mới sân (field) thành công!", HttpStatus.CREATED.value(), responseField)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getAllActive() {
        List<Field> fieldList = fieldRepository.getFieldByIsDeletedFalseAndIsActiveTrue();
        if (fieldList.isEmpty()) {
            return ResponseEntity.ok(
                    new BaseResponse("Không có sân nào được tìm thấy.", HttpStatus.OK.value(), null)
            );
        }

        List<FieldResponse> responseFields = fieldList.stream().map(fieldMapper::convertToDTO).toList();
        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy danh sách sân.", HttpStatus.OK.value(), responseFields)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getById(String fieldId) {
        Field field = fieldRepository.findById(fieldId).orElseThrow(
                () -> new NotFoundException("Không tìm thấy sân!")
        );

        FieldResponse responseField = fieldMapper.convertToDTO(field);
        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy sân.", HttpStatus.OK.value(), responseField)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> getAllSoftDeleted() {
        List<Field> listDeleted = fieldRepository.getFieldByIsDeletedTrue();
        if (listDeleted.isEmpty()) {
            throw new NotFoundException("Không tìm thấy Field nào bị xoá mềm.");
        }

        List<FieldResponse> responseField = listDeleted.stream().map(fieldMapper::convertToDTO).toList();
        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy danh sách Field bị xoá mềm.", HttpStatus.OK.value(), responseField)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> updateById(String fieldId, FieldRequest newField) {
        Field field = fieldRepository.findById(fieldId).orElseThrow(() ->
                new NotFoundException("Không tìm thấy Field!"));

        Field updatedField = fieldRepository.save(fieldMapper.replaceAll(field, newField));

        FieldResponse responseField = fieldMapper.convertToDTO(updatedField);

        return ResponseEntity.ok(
                new BaseResponse("Cập nhật Field thành công.", HttpStatus.OK.value(), responseField)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> toggleActiveStatus(String fieldId) {
        Field field = fieldRepository.findById(fieldId).orElseThrow(() ->
                new NotFoundException("Không tìm thấy Field!"));

        field.setIsActive(!field.getIsActive());
        Field updatedField = fieldRepository.save(field);

        FieldResponse responseField = fieldMapper.convertToDTO(updatedField);
        return ResponseEntity.ok(
                new BaseResponse("Đổi trạng thái active thành công."
                        + "Trạng thái Field hiện tại: " + updatedField.getIsActive(),
                        HttpStatus.OK.value(),
                        responseField)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> changeFieldStatus(String fieldId, FieldStatus newStatus) {
        Field field = fieldRepository.findById(fieldId).orElseThrow(() ->
                new NotFoundException("Không tìm thấy Field!"));

        // Đổi trạng thái của Field sang trạng thái mới
        field.setFieldStatus(newStatus);

        Field updatedField = fieldRepository.save(field);
        FieldResponse responseField = fieldMapper.convertToDTO(updatedField);

        return ResponseEntity.ok(
                new BaseResponse("Thay đổi trạng thái sân thành công.", HttpStatus.OK.value(), responseField)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> softDeleted(String fieldId) {
        Field field = fieldRepository.findById(fieldId).orElseThrow(() ->
                new NotFoundException("Không tìm thấy Field!"));

        field.setIsDeleted(true);

        Field updatedField = fieldRepository.save(field);
        FieldResponse responseField = fieldMapper.convertToDTO(updatedField);

        return ResponseEntity.ok(
                new BaseResponse("Xoá mềm sân thành công.", HttpStatus.OK.value(), responseField)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> restore(String fieldId) {
        Field field = fieldRepository.findById(fieldId).orElseThrow(() ->
                new NotFoundException("Không tìm thấy Field!"));

        field.setIsDeleted(false);

        Field updatedField = fieldRepository.save(field);
        FieldResponse responseField = fieldMapper.convertToDTO(updatedField);

        return ResponseEntity.ok(
                new BaseResponse("Khôi phục sân thành công.", HttpStatus.OK.value(), responseField)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> forceDelete(String fieldId) {
        Field field = fieldRepository.findById(fieldId).orElseThrow(() ->
                new NotFoundException("Không tìm thấy Field!"));
        FieldResponse resonseField = fieldMapper.convertToDTO(field);

        // xoá cứng
        fieldRepository.deleteById(fieldId);

        return ResponseEntity.ok(
                new BaseResponse("Xoá cứng Field thành công.", HttpStatus.OK.value(), resonseField)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> searchByNameContainingIgnoreCase(String fieldName) {
        List<Field> fieldList = fieldRepository.searchByFieldNameContainingIgnoreCase(fieldName);

        if (fieldList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy Field có tên này.", HttpStatus.NOT_FOUND.value(), null)
            );
        }

        List<FieldResponse> responseFields = fieldList.stream().map(fieldMapper::convertToDTO).toList();
        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy danh sách sân.", HttpStatus.OK.value(), responseFields)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> findByFieldType(FieldType fieldType) {
        List<Field> fieldList = fieldRepository.findByFieldType(fieldType);

        if (fieldList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy sân thuộc loại " + fieldType.name() + ".", HttpStatus.NOT_FOUND.value(), null)
            );
        }

        List<FieldResponse> responseFields = fieldList.stream().map(fieldMapper::convertToDTO).toList();
        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy danh sách sân thuộc loại " + fieldType.name() + ".", HttpStatus.OK.value(), responseFields)
        );
    }

    @Override
    public ResponseEntity<BaseResponse> findByFieldStatus(FieldStatus fieldStatus) {
        List<Field> fieldList = fieldRepository.findByFieldStatus(fieldStatus);

        if (fieldList.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new BaseResponse("Không tìm thấy sân có trạng thái " + fieldStatus.name() + ".", HttpStatus.NOT_FOUND.value(), null)
            );
        }

        List<FieldResponse> responseFields = fieldList.stream().map(fieldMapper::convertToDTO).toList();
        return ResponseEntity.ok(
                new BaseResponse("Tìm thấy danh sách sân có trạng thái " + fieldStatus.name() + ".", HttpStatus.OK.value(), responseFields)
        );
    }
}
