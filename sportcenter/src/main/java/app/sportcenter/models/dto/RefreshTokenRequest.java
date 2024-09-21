package app.sportcenter.models.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RefreshTokenRequest {
    @NotBlank(message = "Vui lòng nhập refresh token")
    private String token;
}
