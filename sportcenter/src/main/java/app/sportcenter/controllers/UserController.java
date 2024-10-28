package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.UserRequest;
import app.sportcenter.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {
    @Autowired
    private UserService userService;

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PutMapping("/updateProfile")
    public ResponseEntity<BaseResponse> updateCurrentUser(@Valid @RequestBody UserRequest userRequest) {
        return userService.updateInfoCurrentUser(userRequest);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @GetMapping("/myProfile")
    public ResponseEntity<BaseResponse> getCurrentProfile() {
        return userService.getCurrentProfile();
    }
}
