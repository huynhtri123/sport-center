package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.TournamentRequest;
import app.sportcenter.services.TournamentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tounament")
public class TournamentController {
    @Autowired
    private TournamentService tournamentService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<BaseResponse> create(@Valid @RequestBody TournamentRequest tournamentRequest) {
        return tournamentService.create(tournamentRequest);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/getById/{id}")
    public ResponseEntity<BaseResponse> getById(@PathVariable String id) {
        return tournamentService.getById(id);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/update/{tounamentId}")
    public ResponseEntity<BaseResponse> update(@PathVariable String tounamentId, @Valid @RequestBody TournamentRequest tournamentRequest) {
        return tournamentService.update(tounamentId, tournamentRequest);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/softDelete/{tounamentId}")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable String tounamentId) {
        return tournamentService.delete(tounamentId);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/getAll")
    public ResponseEntity<BaseResponse> getAll() {
        return tournamentService.getAll();
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/restore/{tounamentId}")
    public ResponseEntity<BaseResponse> restore(@PathVariable String tounamentId) {
        return tournamentService.restore(tounamentId);
    }
}
