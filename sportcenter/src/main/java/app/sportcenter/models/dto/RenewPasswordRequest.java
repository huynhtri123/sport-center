package app.sportcenter.models.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RenewPasswordRequest {
    @NotBlank(message = "Vui lòng nhập mật khẩu")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()\\-+]).{8,20}$",
            message = "Mật khẩu phải chứa ít nhất 1 chữ số, 1 chữ thường," +
                    " 1 chữ hoa, 1 ký tự đặc biệt và có độ dài từ 8-20 ký tự")
    @JsonProperty("Password")
    private String password;

    @NotBlank(message = "Vui lòng nhập lại mật khẩu")
    @JsonProperty("ComfirmPassword")
    private String comfirmPassword;

    @NotBlank(message = "Vui lòng nhập mã xác thực khôi phục mật khẩu")
    @JsonProperty("ResetPasswordCode")
    private String resetPasswordCode;
}
