package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.NotificationRequest;
import app.sportcenter.services.NotificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notification")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<BaseResponse> create(@Valid @RequestBody NotificationRequest notificationRequest) {
        return notificationService.create(notificationRequest);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/{notificationId}")
    public ResponseEntity<BaseResponse> getById(@PathVariable String notificationId) {
        return notificationService.getById(notificationId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/all-active")
    public ResponseEntity<BaseResponse> getAllActive() {
        return notificationService.getAllActive();
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/soft-deleted")
    public ResponseEntity<BaseResponse> getAllSoftDeleted() {
        return notificationService.getAllSoftDeleted();
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<BaseResponse> findByUserId(@PathVariable String userId) {
        return notificationService.findByUserId(userId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/title/{title}")
    public ResponseEntity<BaseResponse> findByTitle(@PathVariable String title) {
        return notificationService.findByTitle(title);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PutMapping("/update/{notificationId}")
    public ResponseEntity<BaseResponse> update(@PathVariable String notificationId, @Valid @RequestBody NotificationRequest notificationRequest) {
        return notificationService.update(notificationId, notificationRequest);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PatchMapping("/soft-delete/{notificationId}")
    public ResponseEntity<BaseResponse> softDelete(@PathVariable String notificationId) {
        return notificationService.softDelete(notificationId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PatchMapping("/restore/{notificationId}")
    public ResponseEntity<BaseResponse> restore(@PathVariable String notificationId) {
        return notificationService.restore(notificationId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @DeleteMapping("/force-delete/{notificationId}")
    public ResponseEntity<BaseResponse> forceDelete(@PathVariable String notificationId) {
        return notificationService.forceDelete(notificationId);
    }

    // người dùng tự lấy danh sách thông báo của mình
    // (chỉ được phép khi thông tin đăng nhập hiện tại khớp với userId trên url)
    @PreAuthorize("hasAnyAuthority('CUSTOMER')")
    @GetMapping("/my-notifications/{userId}")
    public ResponseEntity<BaseResponse> getMyNotifications(@PathVariable String userId) {
        return notificationService.getNotificationsForCurrentUser(userId);
    }

}
