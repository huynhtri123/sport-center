package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;

public interface AuthenticationService {
    public void autoCreateAdminAccount();
    public VerifyResponse signup(SignupRequest signupRequest);
    public UserResponse verifyUser(String userId, VerifyRequest verifyRequest);
    public ResponseEntity<BaseResponse> signin(SigninRequest signinRequest, HttpServletResponse response);
    public ResponseEntity<BaseResponse> refreshToken(HttpServletRequest request, HttpServletResponse response);
    public ResponseEntity<BaseResponse> sendVerifyRequest(ForgotPasswordRequest forgotPasswordRequest);
    public UserResponse renewPassword(String userId, RenewPasswordRequest renewPasswordRequest);

    public void signout(HttpServletRequest request, HttpServletResponse response);
}
