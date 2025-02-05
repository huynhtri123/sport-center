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
    @GetMapping("/public/field/all-active")
    public ResponseEntity<BaseResponse> getAllActive(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return fieldService.getAllActive(page, size);
    }

    // public
    @GetMapping("/public/field/{fieldId}")
    public ResponseEntity<BaseResponse> getById(@PathVariable("fieldId") String fieldId) {
        return fieldService.getById(fieldId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/field/soft-deleted")
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
    @PatchMapping("/field/toggle-active-status/{fieldId}")
    public ResponseEntity<BaseResponse> toggleActiveStatus(@PathVariable("fieldId") String fieldId) {
        return fieldService.toggleActiveStatus(fieldId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PatchMapping("/field/soft-delete/{fieldId}")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable("fieldId") String fieldId) {
        return fieldService.softDeleted(fieldId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PatchMapping("/field/restore/{fieldId}")
    public ResponseEntity<BaseResponse> restore(@PathVariable("fieldId") String fieldId) {
        return fieldService.restore(fieldId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @DeleteMapping("/field/force-delete/{fieldId}")
    public ResponseEntity<BaseResponse> forceDelete(@PathVariable("fieldId") String fieldId) {
        return fieldService.forceDelete(fieldId);
    }

    // public
    @GetMapping("/public/field/search-by-name")
    public ResponseEntity<BaseResponse> searchByNameContainingIgnoreCase(
            @RequestParam("fieldName") String fieldName) {
        return fieldService.searchByNameContainingIgnoreCase(fieldName);
    }

    @GetMapping("/public/field/sport/{sportId}")
    public ResponseEntity<BaseResponse> findBySportId(@PathVariable("sportId") String sportId) {
        return fieldService.findBySportId(sportId);
    }


    @GetMapping("/public/field/search-by-name-paginate")
    public ResponseEntity<BaseResponse> searchByNameAndPaginate(
            @RequestParam("fieldName") String fieldName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return fieldService.searchByNameAndPaginate(fieldName, page, size);
    }

}
