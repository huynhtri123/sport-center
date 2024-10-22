package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.TounamentRequest;
import app.sportcenter.services.TounamentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tounament")
public class TounamentController {
    @Autowired
    private TounamentService tounamentService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<BaseResponse> create(@Valid @RequestBody TounamentRequest tounamentRequest) {
        return tounamentService.create(tounamentRequest);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<BaseResponse> getById(@PathVariable String id) {
        return tounamentService.getById(id);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/update/{tounamentId}")
    public ResponseEntity<BaseResponse> update(@PathVariable String tounamentId, @Valid @RequestBody TounamentRequest tounamentRequest) {
        return tounamentService.update(tounamentId, tounamentRequest);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/softDelete/{tounamentId}")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable String tounamentId) {
        return tounamentService.delete(tounamentId);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/getAll")
    public ResponseEntity<BaseResponse> getAll() {
        return tounamentService.getAll();
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/restore/{tounamentId}")
    public ResponseEntity<BaseResponse> restore(@PathVariable String tounamentId) {
        return tounamentService.restore(tounamentId);
    }
}
