package app.sportcenter.models.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PricePolicyResponse {
    private Double price;
    private List<Integer> daysOfWeek;
}
