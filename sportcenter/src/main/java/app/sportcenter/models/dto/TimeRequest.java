package app.sportcenter.models.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeRequest {
    @NotNull(message = "Bạn chưa nhập thời gian")
    private ZonedDateTime time;
}
