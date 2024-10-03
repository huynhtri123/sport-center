package app.sportcenter.models.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SigninRequest {
    @NotBlank(message = "Vui lòng nhập email")
    @Email(message = "Vui lòng nhập đúng định dạng email")
    private String email;

    @NotBlank(message = "Vui lòng nhập mật khẩu")
    private String password;
}
