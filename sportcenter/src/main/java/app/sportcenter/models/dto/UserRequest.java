package app.sportcenter.models.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class UserRequest extends BaseRequestDTO {
    @NotBlank(message = "Số điện thoại không được bỏ trống!")
    private String phoneNumber;

    @NotBlank(message = "Địa chỉ không được bỏ trống!")
    private String address;

    @NotNull(message = "Ngày sinh không được bỏ trống!")
    private ZonedDateTime dateOfBirth;

    private String avatarUrl = "https://res.cloudinary.com/dftznqjsj/image/upload/v1729934084/round-account-button-with-user-inside_ehcrfp.png";
}
