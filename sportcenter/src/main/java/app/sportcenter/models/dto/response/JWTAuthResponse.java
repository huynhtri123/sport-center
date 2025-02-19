package app.sportcenter.models.dto.response;

import lombok.Data;

@Data
public class JWTAuthResponse {
    private String email;
    private String role;
    private String tokenType;
    private String token;
    private String refreshToken;
}
