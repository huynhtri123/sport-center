package app.sportcenter.controllers;


import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.TeamRequest;
import app.sportcenter.services.TeamService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/team")
public class TeamController {
    @Autowired
    private TeamService teamService;


    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<BaseResponse> create(@Valid @RequestBody TeamRequest teamRequest) {
        return teamService.create(teamRequest);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/getById/{teamId}")
    public ResponseEntity<BaseResponse> getById(@PathVariable String teamId) {
        return teamService.getById(teamId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PutMapping("/update/{teamId}")
    public ResponseEntity<BaseResponse> update(@PathVariable String teamId,@Valid @RequestBody TeamRequest teamRequest) {
        return teamService.update(teamId, teamRequest);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PatchMapping("/softDelete/{teamId}")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable String teamId) {
        return teamService.delete(teamId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/getAll")
    public ResponseEntity<BaseResponse> getAll() {
        return teamService.getAll();
    }

    @PatchMapping("/restore/{teamId}")
    public ResponseEntity<BaseResponse> restore(@PathVariable String teamId) {
        return teamService.restore(teamId);
    }
}
