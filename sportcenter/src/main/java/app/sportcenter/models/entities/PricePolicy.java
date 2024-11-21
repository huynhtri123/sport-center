package app.sportcenter.models.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PricePolicy {
    private Double price;
    private List<Integer> daysOfWeek;       // t2-cn <=> 1-7
}
