package app.sportcenter.models.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Player {
    private String name;        // tên cầu thủ
    private String position;    // vị trí (optional)
    private Integer number;     // số áo (optional)
}
