package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.request.NotificationRequest;
import app.sportcenter.models.dto.response.NotificationResponse;
import app.sportcenter.services.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notification")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<BaseResponse> create(@Valid @RequestBody NotificationRequest notificationRequest) {
        return ResponseEntity.ok(
                new BaseResponse("Notification created successfully.", 200,
                        notificationService.create(notificationRequest))
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/{notificationId}")
    public ResponseEntity<BaseResponse> getById(@PathVariable String notificationId) {
        return ResponseEntity.ok(
                new BaseResponse("Get notification by id successfully!", 200,
                        notificationService.getById(notificationId))
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/all-active")
    public ResponseEntity<Map<String, Object>> getAllActive(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Page<NotificationResponse> notificationPage = notificationService.getAllActive(page, size, sortBy, sortDir);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Get active notifications successfully!");
        response.put("status", 200);
        response.put("data", notificationPage.getContent());
        response.put("totalPages", notificationPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<BaseResponse> getNotificationsForUser(
            @PathVariable("userId") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<NotificationResponse> notifications = notificationService.getNotificationsForUser(userId, pageable);

        String message = "Get notifications for user " + userId + " successfully!";
        return ResponseEntity.ok(
                new BaseResponse(message, 200, notifications)
        );
    }


    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/soft-deleted")
    public ResponseEntity<BaseResponse> getAllSoftDeleted() {
        return notificationService.getAllSoftDeleted();
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

}
