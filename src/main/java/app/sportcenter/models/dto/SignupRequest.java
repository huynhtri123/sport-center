package app.sportcenter.models.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    @NotBlank(message = "Vui lòng nhập họ tên")
    @Size(max = 50, message = "Họ tên không được vượt quá 50 ký tự")
    @JsonProperty("FullName")
    private String fullName;

    @NotBlank(message = "Vui lòng nhập email")
    @Email(message = "Vui lòng nhập đúng định dạng email")
    @JsonProperty("Email")
    private String email;

    @NotBlank(message = "Vui lòng nhập mật khẩu")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()\\-+]).{8,20}$",
            message = "Mật khẩu phải chứa ít nhất 1 chữ số, 1 chữ thường," +
                    " 1 chữ hoa, 1 ký tự đặc biệt và có độ dài từ 8-20 ký tự")
    @JsonProperty("Password")
    private String password;

    @NotBlank(message = "Vui lòng nhập lại mật khẩu")
    @JsonProperty("PasswordConfirm")
    private String passwordConfirm;
}
