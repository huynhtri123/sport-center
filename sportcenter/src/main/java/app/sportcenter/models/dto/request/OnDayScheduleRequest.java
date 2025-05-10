package app.sportcenter.models.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OnDayScheduleRequest {

    @NotBlank(message = "Field ID is required.")
    private String fieldId;

    @NotNull(message = "Start time (ZonedDateTime) is required.")
    private ZonedDateTime startOfDay;

    @NotNull(message = "End time (ZonedDateTime) is required.")
    private ZonedDateTime endOfDay;

}

