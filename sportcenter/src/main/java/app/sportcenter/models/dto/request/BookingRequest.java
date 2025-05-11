package app.sportcenter.models.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class BookingRequest extends BaseRequestDTO {

    @NotBlank(message = "Field ID is required!")
    private String fieldId;

    @NotNull(message = "Start time is required!")
    private ZonedDateTime startTime;

    @NotNull(message = "Number of booking hours is required!")
    @Positive(message = "Number of booking hours must be a positive number!")
    private Integer numberOfHours;

    private Double price = 0.0;
}

