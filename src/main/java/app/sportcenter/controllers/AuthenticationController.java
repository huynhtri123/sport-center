package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.RefreshTokenRequest;
import app.sportcenter.models.dto.SigninRequest;
import app.sportcenter.models.dto.SignupRequest;
import app.sportcenter.models.dto.VerifyRequest;
import app.sportcenter.services.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    @PostMapping("/auth/signup")
    public ResponseEntity<BaseResponse> signup(@Valid @RequestBody SignupRequest signupRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Mã xác thực đã được gửi đến email: " + signupRequest.getEmail(),
                        HttpStatus.OK.value(),
                        authenticationService.signup(signupRequest))
        );
    }
    @PostMapping("/auth/signup/{userId}")
    public ResponseEntity<BaseResponse> signupStep2(@PathVariable("userId") String userId,
                                                    @RequestBody VerifyRequest verifyRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Đăng ký tài khoản thành công!",
                        HttpStatus.OK.value(), authenticationService.verifyUser(userId, verifyRequest))
        );
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
