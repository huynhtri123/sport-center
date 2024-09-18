package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.RefreshTokenRequest;
import app.sportcenter.models.dto.SigninRequest;
import app.sportcenter.models.dto.SignupRequest;
import app.sportcenter.services.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    @PostMapping("/auth/signup")
    public ResponseEntity<BaseResponse> signup(@Valid @RequestBody SignupRequest signupRequest) {
        return authenticationService.signup((signupRequest));
    }

    @PostMapping("/auth/signin")
    public ResponseEntity<BaseResponse> signin(@Valid @RequestBody SigninRequest signinRequest) {
        return authenticationService.signin((signinRequest));
    }

    @PostMapping("/auth/refreshToken")
    public ResponseEntity<BaseResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshTokenRequest) {
        return authenticationService.refreshToken((refreshTokenRequest));
    }
}
