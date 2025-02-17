package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.UserNotificationRequest;
import app.sportcenter.services.UserNotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user-notification")
@RequiredArgsConstructor
public class UserNotificationController {

    private final UserNotificationService service;

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<BaseResponse> create(@RequestBody @Valid UserNotificationRequest request) {
        return ResponseEntity.ok(
                new BaseResponse("Create User-Notification successfully!", 200, service.create(request))
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse> getById(@PathVariable("id") String id) {
        return ResponseEntity.ok(
                new BaseResponse("Get User-Notification by id successfully!", 200, service.getById(id))
        );
    }


    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/all-active")
    public ResponseEntity<BaseResponse> getAllActive(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,DESC") String sort) {

        String[] sortParams = sort.split(",");
        Sort sorting = Sort.by(Sort.Direction.fromString(sortParams[1]), sortParams[0]);
        Pageable pageable = PageRequest.of(page, size, sorting);

        return ResponseEntity.ok(
                new BaseResponse("Get all User-Notification active successfully!", 200,
                        service.getAllActive(pageable).getContent())
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<BaseResponse> getAllActive(
            @PathVariable("userId") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,DESC") String sort) {

        String[] sortParams = sort.split(",");
        Sort sorting = Sort.by(Sort.Direction.fromString(sortParams[1]), sortParams[0]);
        Pageable pageable = PageRequest.of(page, size, sorting);

        return ResponseEntity.ok(
                new BaseResponse("Get all User-Notification by userId successfully!", 200,
                        service.getAllByUserId(userId, pageable).getContent())
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PutMapping("/user/{userId}/set-read")
    public ResponseEntity<BaseResponse> setAllToIsReadForUser(@PathVariable("userId") String userId) {
        String message = "Successfully! Set all notifications to isRead for user {}" + userId;
        return ResponseEntity.ok(
                new BaseResponse(message, 200,
                        service.setAllToIsRead(userId))
        );
    }
}
