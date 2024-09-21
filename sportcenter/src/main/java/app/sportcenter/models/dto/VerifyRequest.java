package app.sportcenter.models.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class VerifyRequest {
    @NotBlank(message = "Vui lòng nhập mã xác minh")
    @Pattern(regexp = "^[0-9]{6}$", message = "Mã xác minh phải có đúng 6 chữ số")
    @JsonProperty("Code")
    private String code;
}
