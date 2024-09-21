package app.sportcenter.models.dto;

import lombok.Data;

@Data
public class JWTAuthResponse {
    private String email;
    private String tokenType;
    private String token;
    private String refreshToken;
}
