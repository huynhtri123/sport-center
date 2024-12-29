package app.sportcenter.controllers;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.*;
import app.sportcenter.services.AuthenticationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
                                                    @Valid @RequestBody VerifyRequest verifyRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Đăng ký tài khoản thành công!",
                        HttpStatus.OK.value(), authenticationService.verifyUser(userId, verifyRequest))
        );
    }

    @PostMapping("/auth/signin")
    public ResponseEntity<BaseResponse> signin(@Valid @RequestBody SigninRequest signinRequest, HttpServletResponse response) {
        return authenticationService.signin(signinRequest, response);
    }

    @PostMapping("/auth/refreshToken")
    public ResponseEntity<BaseResponse> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        return authenticationService.refreshToken(request, response);
    }

    @PostMapping("/auth/getVerify")
    public ResponseEntity<BaseResponse> sendVerifyRequest(@Valid @RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        return authenticationService.sendVerifyRequest(forgotPasswordRequest);
    }

    @PatchMapping("/auth/renewPassword/{userId}")
    public ResponseEntity<BaseResponse> renewPassword(@PathVariable("userId") String userId,
                                                      @Valid @RequestBody RenewPasswordRequest renewPasswordRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(
                new BaseResponse("Password changed successfully.", HttpStatus.OK.value(),
                        authenticationService.renewPassword(userId, renewPasswordRequest))
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'CUSTOMER')")
    @PostMapping("/signout")
    public ResponseEntity<BaseResponse> logout(HttpServletRequest request, HttpServletResponse response) {
        authenticationService.signout(request, response);
        return ResponseEntity.ok(
                new BaseResponse("Log out successfully!", HttpStatus.OK.value(), null)
        );
    }
}
