package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.request.MatchResultRequest;
import app.sportcenter.models.dto.request.MatchesRequest;
import app.sportcenter.services.MatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    // tạo cặp đấu
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PostMapping("/match/create-matches")
    public ResponseEntity<BaseResponse> createMatches(@Valid @RequestBody MatchesRequest matchesRequest) {
        matchService.createMatches(matchesRequest);
        return ResponseEntity.ok(
                new BaseResponse("Create matches successfully!", 200, null)
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PutMapping("/match/update-result")
    public ResponseEntity<BaseResponse> createMatches(@Valid @RequestBody MatchResultRequest matchResultRequest) {
        return ResponseEntity.ok(
                new BaseResponse("Update result for match successfully!", 200,
                        matchService.updateResult(matchResultRequest))
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/match/all-active")
    public ResponseEntity<BaseResponse> getAllActive() {
        return ResponseEntity.ok(
                new BaseResponse("Get all active matches successfully!", 200,
                        matchService.getAllActive())
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/match/{matchId}")
    public ResponseEntity<BaseResponse> getById(@PathVariable("matchId") String matchId) {
        return ResponseEntity.ok(
                new BaseResponse("Get match by id successfully!", 200,
                        matchService.getById(matchId))
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/match/tournament/{tournamentId}")
    public ResponseEntity<BaseResponse> getByTournament(@PathVariable("tournamentId") String tournamentId) {
        return ResponseEntity.ok(
                new BaseResponse("Get match by tournament successfully!", 200,
                        matchService.getByTournament(tournamentId))
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PutMapping("/match/award/{tournamentId}")
    public ResponseEntity<BaseResponse> award(@PathVariable("tournamentId") String tournamentId) {
        return ResponseEntity.ok(
                new BaseResponse("Award successfully!", 200, matchService.award(tournamentId))
        );
    }

}
