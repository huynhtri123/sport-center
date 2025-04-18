package app.sportcenter.models.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingData {
    private String field_id;
    private String sport_id;
    private int day_of_week;
    private int hour;
    private int month;
    private double price;
}
