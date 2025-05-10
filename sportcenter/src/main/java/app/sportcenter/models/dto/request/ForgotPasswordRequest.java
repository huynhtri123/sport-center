package app.sportcenter.models.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    @NotBlank(message = "Please enter your email.")
    @Email(message = "Please enter a valid email address.")
    private String email;
}

