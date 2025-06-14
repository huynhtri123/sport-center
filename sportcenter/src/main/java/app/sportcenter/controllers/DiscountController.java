package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.request.DiscountConfigRequest;
import app.sportcenter.services.DiscountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DiscountController {

    private final DiscountService discountService;

    @PostMapping("/discount")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<BaseResponse> create(@Valid @RequestBody DiscountConfigRequest request) {
        return ResponseEntity.ok(
                new BaseResponse("Create discount config successfully!", 200, discountService.create(request))
        );
    }

    @GetMapping("/public/discount")
    public ResponseEntity<BaseResponse> getAll() {
        return ResponseEntity.ok(
                new BaseResponse("Fetch discount configs successfully!", 200, discountService.getAllActive())
        );
    }

    @GetMapping("/discount/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<BaseResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                new BaseResponse("Fetch discount config successfully!", 200, discountService.getById(id))
        );
    }

    @PutMapping("/discount/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<BaseResponse> update(@PathVariable String id, @Valid @RequestBody DiscountConfigRequest request) {
        return ResponseEntity.ok(
                new BaseResponse("Update discount config successfully!", 200, discountService.updateById(id, request))
        );
    }

    @PutMapping("/discount/soft-delete/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable String id) {
        return ResponseEntity.ok(
                new BaseResponse("Delete discount config successfully!", 200, discountService.softDelete(id))
        );
    }

    @PutMapping("/discount/restore/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<BaseResponse> restore(@PathVariable String id) {
        return ResponseEntity.ok(
                new BaseResponse("Restore discount config successfully!", 200, discountService.restore(id))
        );
    }

}
