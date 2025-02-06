package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.CloudinaryResponse;
import app.sportcenter.models.dto.TournamentRegisterRequest;
import app.sportcenter.models.dto.TournamentRequest;
import app.sportcenter.models.dto.UnregisterTournamentRequest;
import app.sportcenter.models.entities.User;
import app.sportcenter.services.CloudinaryService;
import app.sportcenter.services.TournamentService;
import app.sportcenter.utils.FileUploadUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TournamentController {

    private final TournamentService tournamentService;
    private final CloudinaryService cloudinaryService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/tounament/create")
    public ResponseEntity<BaseResponse> create(@Valid @RequestBody TournamentRequest tournamentRequest) {
        return tournamentService.create(tournamentRequest);
    }

    // public
    @GetMapping("/public/tounament/all-active")
    public ResponseEntity<BaseResponse> getAllActive(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return tournamentService.getAllActive(page, size);
    }

    // public
    @GetMapping("/public/tounament/{tournamentId}")
    public ResponseEntity<BaseResponse> getById(@PathVariable("tournamentId") String tournamentId) {
        return tournamentService.getById(tournamentId);
    }

    // public
    @GetMapping("/public/tounament/sport")
    public ResponseEntity<BaseResponse> getBySportId(@RequestParam("sportId") String sportId) {
        return tournamentService.getBySportId(sportId);
    }

    // public
    @GetMapping("/public/tounament/registed-teams/{tournamentId}")
    public ResponseEntity<BaseResponse> getRegistedTeams(@PathVariable("tournamentId") String tournamentId) {
        return tournamentService.getRegistedTeams(tournamentId);
    }

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @GetMapping("/tounament/my-tournaments")
    public ResponseEntity<BaseResponse> myTournaments() {
        return tournamentService.myRegistered();
    }

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @GetMapping("/tounament/my-team/{tournamentId}")
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
    @PatchMapping("/tounament/soft-delete/{tournamentId}")
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
    @DeleteMapping("/tounament/force-delete/{tournamentId}")
    public ResponseEntity<BaseResponse> forceDelete(@PathVariable("tournamentId") String tournamentId) {
        return tournamentService.forceDelete(tournamentId);
    }

    // for customer
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PatchMapping("/tounament/register")
    public ResponseEntity<BaseResponse> register(@Valid @RequestPart("request") TournamentRegisterRequest request,
                                                 @RequestPart(name = "file", required = false) MultipartFile file) {
        if (file != null && !file.isEmpty()) {
            FileUploadUtil.assertAllowedImage(file);
            final String fileName = FileUploadUtil.getFileName(file.getOriginalFilename());
            final CloudinaryResponse response = cloudinaryService.uploadFile(file, fileName);

            request.getTeamRequest().setTeamLogoUrl(response.getUrl());
        }

        return tournamentService.register(request);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PatchMapping("/tounament/check-registration-eligibility")
    public ResponseEntity<BaseResponse> checkRegistrationEligibility(@Valid @RequestBody TournamentRegisterRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        try {
            tournamentService.checkRegistrationEligibility(request.getTournamentId(), currentUser);
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
    public ResponseEntity<BaseResponse> unregister(@Valid @RequestBody UnregisterTournamentRequest request) {
        return tournamentService.unregister(request);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PutMapping("/tournament/team/{teamId}")
    public ResponseEntity<BaseResponse> updateTeam(
            @Valid @RequestPart("request") TournamentRegisterRequest request,
            @PathVariable("teamId") String teamId,
            @RequestPart(name = "file", required = false) MultipartFile file) {

        if (file != null && !file.isEmpty()) {
            FileUploadUtil.assertAllowedImage(file);
            final String fileName = FileUploadUtil.getFileName(file.getOriginalFilename());
            final CloudinaryResponse response = cloudinaryService.uploadFile(file, fileName);

            request.getTeamRequest().setTeamLogoUrl(response.getUrl());
        }

        return ResponseEntity.ok(
                new BaseResponse("Update registered team successfully!", 200,
                        tournamentService.updateTeam(request, teamId))
        );
    }

    @GetMapping("/public/tounament/search-by-name")
    public ResponseEntity<BaseResponse> searchByNameAndPaginate(
            @RequestParam("tournamentName") String tournamentName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return tournamentService.searchByNameAndPaginate(tournamentName, page, size);
    }


}
