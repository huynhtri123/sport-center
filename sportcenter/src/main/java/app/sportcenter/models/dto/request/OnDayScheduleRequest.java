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
    @NotBlank(message = "Bạn chưa nhập id sân")
    private String fieldId;
    @NotNull(message = "Bạn chưa nhập giờ bắt đầu (ZoneDateTime)")
    private ZonedDateTime startOfDay;
    @NotNull(message = "Bạn chưa nhập giờ kết thúc (ZoneDateTime)")
    private ZonedDateTime endOfDay;
}
