package app.sportcenter.models.entities;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prize {
    private Integer position;       // vị trí xếp hạng
    private String description;
    private Double reward;          // giải thưởng (USD)
}
