package app.sportcenter.models.dto;

import jakarta.validation.constraints.*;
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

    @NotBlank(message = "Full name must not be null or blank!")
    @Size(max = 50, message = "Full name must not exceed 50 characters!")
    private String fullName;

    @NotBlank(message = "Phone number must not be null or blank!")
    @Pattern(
            regexp = "^[0-9]{10}$",
            message = "Phone number must be exactly 10 digits!"
    )
    private String phoneNumber;

    @NotBlank(message = "Address must not be null or blank!")
    @Size(max = 255, message = "Address must not exceed 255 characters!")
    private String address;

    @NotNull(message = "Date of birth must not be null!")
    @Past(message = "Date of birth must be in the past!")
    private ZonedDateTime dateOfBirth;

    private String avatarUrl = "https://res.cloudinary.com/dftznqjsj/image/upload/v1729934084/round-account-button-with-user-inside_ehcrfp.png";
}
