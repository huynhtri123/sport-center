package app.sportcenter.controllers;


import app.sportcenter.commons.BaseResponse;
import app.sportcenter.exceptions.CustomException;
import app.sportcenter.models.dto.CloudinaryResponse;
import app.sportcenter.models.dto.TeamRequest;
import app.sportcenter.models.entities.User;
import app.sportcenter.services.CloudinaryService;
import app.sportcenter.services.TeamService;
import app.sportcenter.utils.FileUploadUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/team")
public class TeamController {
    @Autowired
    private TeamService teamService;
    @Autowired
    private CloudinaryService cloudinaryService;

    // chỉ có người đang đăng nhập mới có thể tự tạo team cho mình
    @PreAuthorize("hasAnyAuthority('CUSTOMER')")
    @PostMapping("/create")
    public ResponseEntity<BaseResponse> create(@Valid @RequestBody TeamRequest teamRequest) {
        return teamService.create(teamRequest);
    }

    // public
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/{teamId}")
    public ResponseEntity<BaseResponse> getById(@PathVariable String teamId) {
        return teamService.getById(teamId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<BaseResponse> getAll() {
        return teamService.getAll();
    }

    // chỉ có chủ sở hữu team được dùng
    @PreAuthorize("hasAnyAuthority('CUSTOMER')")
    @GetMapping("/my-teams")
    public ResponseEntity<BaseResponse> myTeams() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        if (currentUser == null) {
            throw new CustomException("Không tìm thấy thông tin đăng nhập!", HttpStatus.BAD_REQUEST.value());
        }
        String userId = currentUser.getId();

        return teamService.myTeams(userId);
    }

    // chỉ có chủ sở hữu team và admin được dùng
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PutMapping("/update/{teamId}")
    public ResponseEntity<BaseResponse> update(@PathVariable String teamId,@Valid @RequestBody TeamRequest teamRequest) {
        return teamService.update(teamId, teamRequest);
    }

    // chỉ có chủ sở hữu team và admin được dùng
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PatchMapping("/soft-delete/{teamId}")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable String teamId) {
        return teamService.softDelete(teamId);
    }

    // chỉ có chủ sở hữu team và admin được dùng
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PatchMapping("/restore/{teamId}")
    public ResponseEntity<BaseResponse> restore(@PathVariable String teamId) {
        return teamService.restore(teamId);
    }

    // chỉ có chủ sở hữu team và admin được dùng
    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @DeleteMapping("/force-delete/{teamId}")
    public ResponseEntity<BaseResponse> forceDelete(@PathVariable String teamId) {
        return teamService.forceDelete(teamId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/check-existed-name")
    public ResponseEntity<BaseResponse> checkExistedName(@RequestParam("teamName") String teamName) {
        boolean isExisted = teamService.checkExistedTeam(teamName);
        if (isExisted) {
            throw new CustomException("Tên đội đã tồn tại, vui lòng chọn tên khác!", HttpStatus.BAD_REQUEST.value());
        }
        return ResponseEntity.ok(
                new BaseResponse("Đội này chưa tồn tại, có thể tạo mới", HttpStatus.OK.value(), teamName)
        );
    }

}
