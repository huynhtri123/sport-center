package app.sportcenter.models.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CancelRecurringInfo {
    private RecurringBookingResponse response;
    private Double refund;
}
