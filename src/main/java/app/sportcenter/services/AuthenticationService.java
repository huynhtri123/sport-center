package app.sportcenter.services;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.dto.BaseResponseDTO;
import app.sportcenter.models.dto.RefreshTokenRequest;
import app.sportcenter.models.dto.SigninRequest;
import app.sportcenter.models.dto.SignupRequest;
import org.springframework.http.ResponseEntity;

public interface AuthenticationService {
    public void autoCreateAdminAccount();
    public ResponseEntity<BaseResponse> signup(SignupRequest signupRequest);
    public ResponseEntity<BaseResponse> signin(SigninRequest signinRequest);
    public ResponseEntity<BaseResponse> refreshToken(RefreshTokenRequest refreshTokenRequest);
}
