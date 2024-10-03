package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.SportRequest;
import app.sportcenter.services.SportService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sport")
public class SportController {
    @Autowired
    private SportService sportService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<BaseResponse> create(@Valid @RequestBody SportRequest sportRequest) {
        return sportService.create(sportRequest);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/getById/{sportId}")
    public ResponseEntity<BaseResponse> getById(@PathVariable String sportId) {
        return sportService.getById(sportId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PutMapping("/update/{sportId}")
    public ResponseEntity<BaseResponse> update(@PathVariable String sportId,@Valid @RequestBody SportRequest sportRequest) {
        return sportService.update(sportId, sportRequest);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PatchMapping("/softDelete/{sportId}")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable String sportId) {
        return sportService.delete(sportId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/getAll")
    public ResponseEntity<BaseResponse> getAll() {
        return sportService.getAll();
    }

    @PatchMapping("/restore/{sportId}")
    public ResponseEntity<BaseResponse> restore(@PathVariable String sportId) {
        return sportService.restore(sportId);
    }
}
