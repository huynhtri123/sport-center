package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.commons.FieldStatus;
import app.sportcenter.commons.FieldType;
import app.sportcenter.models.dto.FieldRequest;
import app.sportcenter.services.FieldService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class FieldController {
    @Autowired
    private FieldService fieldService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/field/create")
    public ResponseEntity<BaseResponse> create(@Valid @RequestBody FieldRequest fieldRequest) {
        return fieldService.create(fieldRequest);
    }

    // public - Lấy tất cả Field đang hoạt động (active & not deleted)
    @GetMapping("/public/field/getAllActive")
    public ResponseEntity<BaseResponse> getAll() {
        return fieldService.getAllActive();
    }

    // public
    @GetMapping("/public/field/getById/{fieldId}")
    public ResponseEntity<BaseResponse> getById(@PathVariable("fieldId") String fieldId) {
        return fieldService.getById(fieldId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/field/getAllSoftDeleted")
    public ResponseEntity<BaseResponse> getAllSoftDeleted() {
        return fieldService.getAllSoftDeleted();
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PutMapping("/field/update/{fieldId}")
    public ResponseEntity<BaseResponse> updateById(@PathVariable(value = "fieldId") String fieldId,
                                                   @Valid @RequestBody FieldRequest fieldRequest) {
        return fieldService.updateById(fieldId, fieldRequest);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PatchMapping("/field/toggleActiveStatus/{fieldId}")
    public ResponseEntity<BaseResponse> toggleActiveStatus(@PathVariable("fieldId") String fieldId) {
        return fieldService.toggleActiveStatus(fieldId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PatchMapping("/field/softDelete/{fieldId}")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable("fieldId") String fieldId) {
        return fieldService.softDeleted(fieldId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PatchMapping("/field/restore/{fieldId}")
    public ResponseEntity<BaseResponse> restore(@PathVariable("fieldId") String fieldId) {
        return fieldService.restore(fieldId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @DeleteMapping("/field/forceDelete/{fieldId}")
    public ResponseEntity<BaseResponse> forceDelete(@PathVariable("fieldId") String fieldId) {
        return fieldService.forceDelete(fieldId);
    }

    // public
    @GetMapping("/public/field/searchByName")
    public ResponseEntity<BaseResponse> searchByNameContainingIgnoreCase(
            @RequestParam("fieldName") String fieldName) {
        return fieldService.searchByNameContainingIgnoreCase(fieldName);
    }

    // public
    @GetMapping("/public/field/findByType")
    public ResponseEntity<BaseResponse> findByFieldType(@RequestParam("type") FieldType fieldType) {
        return fieldService.findByFieldType(fieldType);
    }

}
