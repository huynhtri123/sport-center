package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.PlayerRequest;
import app.sportcenter.services.PlayerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/player")
public class PlayerController {
    @Autowired
    private PlayerService playerService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<BaseResponse> create(@Valid @RequestBody PlayerRequest playerRequest) {
        return playerService.create(playerRequest);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/getById/{playerId}")
    public ResponseEntity<BaseResponse> getById(@PathVariable String playerId) {
        return playerService.getById(playerId);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/softDelete/{playerId}")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable String playerId) {
        return playerService.delete(playerId);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/update/{playerId}")
    public ResponseEntity<BaseResponse> update(@PathVariable String playerId, @Valid @RequestBody PlayerRequest playerRequest) {
        return playerService.update(playerId, playerRequest);
    }
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/getAll")
    public ResponseEntity<BaseResponse> getAll() {
        return playerService.getAll();
    }
    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/restore/{playerId}")
    public ResponseEntity<BaseResponse> restore(@PathVariable String playerId) {
        return playerService.restore(playerId);
    }
}
