package app.sportcenter.models.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RefreshTokenRequest {
    @NotBlank(message = "Please enter the refresh token.")
    private String token;
}

