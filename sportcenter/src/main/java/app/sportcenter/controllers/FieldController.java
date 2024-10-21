package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.FieldStatus;
import app.sportcenter.commons.FieldType;
import app.sportcenter.models.dto.FieldRequest;
import app.sportcenter.models.dto.FieldResponse;
import app.sportcenter.services.FieldService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/field")
public class FieldController {
    @Autowired
    private FieldService fieldService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<BaseResponse> create(@Valid @RequestBody FieldRequest fieldRequest) {
        return fieldService.create(fieldRequest);
    }

    // Lấy tất cả Field đang hoạt động (active & not deleted)
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/getAllActive")
    public ResponseEntity<BaseResponse> getAll() {
        return fieldService.getAllActive();
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/getById/{fieldId}")
    public ResponseEntity<BaseResponse> getById(@PathVariable("fieldId") String fieldId) {
        return fieldService.getById(fieldId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/getAllSoftDeleted")
    public ResponseEntity<BaseResponse> getAllSoftDeleted() {
        return fieldService.getAllSoftDeleted();
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PutMapping("/update/{fieldId}")
    public ResponseEntity<BaseResponse> updateById(@PathVariable(value = "fieldId") String fieldId,
                                                   @Valid @RequestBody FieldRequest fieldRequest) {
        return fieldService.updateById(fieldId, fieldRequest);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PatchMapping("/toggleActiveStatus/{fieldId}")
    public ResponseEntity<BaseResponse> toggleActiveStatus(@PathVariable("fieldId") String fieldId) {
        return fieldService.toggleActiveStatus(fieldId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PatchMapping("/changeStatus/{fieldId}")
    public ResponseEntity<BaseResponse> changeFieldStatus(@PathVariable("fieldId") String fieldId,
                                                          @RequestParam("status") FieldStatus newStatus) {
        FieldResponse fieldResponse = fieldService.changeFieldStatus(fieldId, newStatus);
        return ResponseEntity.ok(
                new BaseResponse("Thay đổi trạng thái sân thành công.", HttpStatus.OK.value(), fieldResponse)
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PatchMapping("/softDelete/{fieldId}")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable("fieldId") String fieldId) {
        return fieldService.softDeleted(fieldId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PatchMapping("/restore/{fieldId}")
    public ResponseEntity<BaseResponse> restore(@PathVariable("fieldId") String fieldId) {
        return fieldService.restore(fieldId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @DeleteMapping("/forceDelete/{fieldId}")
    public ResponseEntity<BaseResponse> forceDelete(@PathVariable("fieldId") String fieldId) {
        return fieldService.forceDelete(fieldId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/searchByName")
    public ResponseEntity<BaseResponse> searchByNameContainingIgnoreCase(
            @RequestParam("fieldName") String fieldName) {
        return fieldService.searchByNameContainingIgnoreCase(fieldName);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/findByType")
    public ResponseEntity<BaseResponse> findByFieldType(@RequestParam("type") FieldType fieldType) {
        return fieldService.findByFieldType(fieldType);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/findByStatus")
    public ResponseEntity<BaseResponse> findByFieldStatus(@RequestParam("status") FieldStatus fieldStatus) {
        return fieldService.findByFieldStatus(fieldStatus);
    }

}
