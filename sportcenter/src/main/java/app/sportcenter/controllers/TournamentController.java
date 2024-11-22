package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.TournamentRegisterRequest;
import app.sportcenter.models.dto.TournamentRequest;
import app.sportcenter.models.entities.User;
import app.sportcenter.services.TournamentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class TournamentController {
    @Autowired
    private TournamentService tournamentService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/tounament/create")
    public ResponseEntity<BaseResponse> create(@Valid @RequestBody TournamentRequest tournamentRequest) {
        return tournamentService.create(tournamentRequest);
    }

    // public
    @GetMapping("/public/tounament/getAllActive")
    public ResponseEntity<BaseResponse> getAllActive(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return tournamentService.getAllActive(page, size);
    }

    // public
    @GetMapping("/public/tounament/getById/{tournamentId}")
    public ResponseEntity<BaseResponse> getById(@PathVariable("tournamentId") String tournamentId) {
        return tournamentService.getById(tournamentId);
    }

    // public
    @GetMapping("/public/tounament/getBySportId")
    public ResponseEntity<BaseResponse> getBySportId(@RequestParam("sportId") String sportId) {
        return tournamentService.getBySportId(sportId);
    }

    // public
    @GetMapping("/public/tounament/getRegistedTeams/{tournamentId}")
    public ResponseEntity<BaseResponse> getRegistedTeams(@PathVariable("tournamentId") String tournamentId) {
        return tournamentService.getRegistedTeams(tournamentId);
    }

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @GetMapping("/tounament/myTournaments")
    public ResponseEntity<BaseResponse> myTournaments() {
        return tournamentService.myRegistered();
    }

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @GetMapping("/tounament/myTeamInTournament/{tournamentId}")
    public ResponseEntity<BaseResponse> myTeamInTournament(@PathVariable("tournamentId") String tournamentId) {
        return tournamentService.getMyRegisteredTeamInTournament(tournamentId);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/tounament/update/{tournamentId}")
    public ResponseEntity<BaseResponse> updateById(@PathVariable("tournamentId") String tournamentId,
                                                   @RequestBody TournamentRequest tournamentRequest) {
        return tournamentService.updateById(tournamentId, tournamentRequest);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/tounament/softDelete/{tournamentId}")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable("tournamentId") String tournamentId) {
        boolean newIsDeleted = true;
        return tournamentService.toggleDelete(tournamentId, newIsDeleted);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/tounament/restore/{tournamentId}")
    public ResponseEntity<BaseResponse> restore(@PathVariable("tournamentId") String tournamentId) {
        boolean newIsDeleted = false;
        return tournamentService.toggleDelete(tournamentId, newIsDeleted);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/tounament/forceDelete/{tournamentId}")
    public ResponseEntity<BaseResponse> forceDelete(@PathVariable("tournamentId") String tournamentId) {
        return tournamentService.forceDelete(tournamentId);
    }

    // for customer
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PatchMapping("/tounament/register")
    public ResponseEntity<BaseResponse> register(@Valid @RequestBody TournamentRegisterRequest request) {
        return tournamentService.register(request);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PatchMapping("/tounament/checkRegistrationEligibility")
    public ResponseEntity<BaseResponse> checkRegistrationEligibility(@Valid @RequestBody TournamentRegisterRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        try {
            tournamentService.checkRegistrationEligibility(request.getTournamentId(), request.getTeamId(), currentUser);
            return ResponseEntity.ok(
                    new BaseResponse("Đã check! có thể đăng kí giải đấu.",
                            HttpStatus.OK.value(),   null)
            );
        } catch (CustomException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    new BaseResponse("Đã check! Failed. " + e.getMessage(),
                            HttpStatus.BAD_REQUEST.value(),   null)
            );
        }
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PatchMapping("/tounament/unregister")
    public ResponseEntity<BaseResponse> unregister(@Valid @RequestBody TournamentRegisterRequest request) {
        return tournamentService.unregister(request);
    }


}
