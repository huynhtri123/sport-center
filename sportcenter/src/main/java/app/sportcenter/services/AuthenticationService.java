package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.*;
import org.springframework.http.ResponseEntity;

public interface AuthenticationService {
    public void autoCreateAdminAccount();
    public VerifyResponse signup(SignupRequest signupRequest);
    public UserResponse verifyUser(String userId, VerifyRequest verifyRequest);
    public ResponseEntity<BaseResponse> signin(SigninRequest signinRequest);
    public ResponseEntity<BaseResponse> refreshToken(RefreshTokenRequest refreshTokenRequest);
    public ResponseEntity<BaseResponse> sendVerifyRequest(ForgotPasswordRequest forgotPasswordRequest);
    public UserResponse renewPassword(String userId, RenewPasswordRequest renewPasswordRequest);
}
