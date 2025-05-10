package app.sportcenter.models.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {

    @NotBlank(message = "Please enter your full name.")
    @Size(max = 50, message = "Full name must not exceed 50 characters.")
    private String fullName;

    @NotBlank(message = "Please enter your email.")
    @Email(message = "Please enter a valid email address.")
    private String email;

    @NotBlank(message = "Please enter your password.")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()\\-+]).{8,20}$",
            message = "Password must contain at least 1 digit, 1 lowercase letter, " +
                    "1 uppercase letter, 1 special character, and be 8-20 characters long.")
    private String password;

    @NotBlank(message = "Please confirm your password.")
    private String passwordConfirm;
}

