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
@RequestMapping("/api")
public class SportController {
    @Autowired
    private SportService sportService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/sport/create")
    public ResponseEntity<BaseResponse> create(@Valid @RequestBody SportRequest sportRequest) {
        return sportService.create(sportRequest);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/sport/getById/{sportId}")
    public ResponseEntity<BaseResponse> getById(@PathVariable String sportId) {
        return sportService.getById(sportId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PutMapping("/sport/update/{sportId}")
    public ResponseEntity<BaseResponse> update(@PathVariable String sportId,@Valid @RequestBody SportRequest sportRequest) {
        return sportService.update(sportId, sportRequest);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PatchMapping("/sport/softDelete/{sportId}")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable String sportId) {
        return sportService.delete(sportId);
    }

    // api này public được nên ko cần xác thực
    @GetMapping("/public/sport/getAllActive")
    public ResponseEntity<BaseResponse> getAll() {
        return sportService.getAll();
    }

    @PatchMapping("/sport/restore/{sportId}")
    public ResponseEntity<BaseResponse> restore(@PathVariable String sportId) {
        return sportService.restore(sportId);
    }
}
