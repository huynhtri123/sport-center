package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.TournamentRegisterRequest;
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

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/getAllActive")
    public ResponseEntity<BaseResponse> getAllActive() {
        return tournamentService.getAllActive();
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/getById/{tournamentId}")
    public ResponseEntity<BaseResponse> getById(@PathVariable("tournamentId") String tournamentId) {
        return tournamentService.getById(tournamentId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/getBySportId")
    public ResponseEntity<BaseResponse> getBySportId(@RequestParam("sportId") String sportId) {
        return tournamentService.getBySportId(sportId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/getRegistedTeams/{tournamentId}")
    public ResponseEntity<BaseResponse> getRegistedTeams(@PathVariable("tournamentId") String tournamentId) {
        return tournamentService.getRegistedTeams(tournamentId);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/update/{tournamentId}")
    public ResponseEntity<BaseResponse> updateById(@PathVariable("tournamentId") String tournamentId,
                                                   @RequestBody TournamentRequest tournamentRequest) {
        return tournamentService.updateById(tournamentId, tournamentRequest);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/softDelete/{tournamentId}")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable("tournamentId") String tournamentId) {
        boolean newIsDeleted = true;
        return tournamentService.toggleDelete(tournamentId, newIsDeleted);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/restore/{tournamentId}")
    public ResponseEntity<BaseResponse> restore(@PathVariable("tournamentId") String tournamentId) {
        boolean newIsDeleted = false;
        return tournamentService.toggleDelete(tournamentId, newIsDeleted);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/forceDelete/{tournamentId}")
    public ResponseEntity<BaseResponse> forceDelete(@PathVariable("tournamentId") String tournamentId) {
        return tournamentService.forceDelete(tournamentId);
    }

    // for customer
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PatchMapping("/register")
    public ResponseEntity<BaseResponse> register(@Valid @RequestBody TournamentRegisterRequest request) {
        return tournamentService.register(request);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PatchMapping("/unregister")
    public ResponseEntity<BaseResponse> unregister(@Valid @RequestBody TournamentRegisterRequest request) {
        return tournamentService.unregister(request);
    }


}
