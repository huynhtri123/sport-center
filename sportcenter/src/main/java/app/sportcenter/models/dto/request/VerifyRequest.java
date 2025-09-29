package app.sportcenter.models.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class VerifyRequest {
    @NotBlank(message = "Please enter the verification code.")
    @Pattern(regexp = "^[0-9]{6}$", message = "Verification code must be exactly 6 digits.")
    private String code;
}

