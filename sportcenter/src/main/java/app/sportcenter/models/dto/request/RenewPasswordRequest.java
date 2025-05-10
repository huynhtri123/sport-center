package app.sportcenter.models.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RenewPasswordRequest {

    @NotBlank(message = "Please enter the password.")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()\\-+]).{8,20}$",
            message = "Password must contain at least 1 digit, 1 lowercase letter, " +
                    "1 uppercase letter, 1 special character, and be 8-20 characters long.")
    private String password;

    @NotBlank(message = "Please confirm the password.")
    private String comfirmPassword;

    @NotBlank(message = "Please enter the password reset verification code.")
    private String resetPasswordCode;
}

