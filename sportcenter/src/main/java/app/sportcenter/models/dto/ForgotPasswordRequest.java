package app.sportcenter.models.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    @NotBlank(message = "Vui lòng nhập email.")
    @Email(message = "Vui lòng nhập đúng định dạng email.")
    private String email;
}
