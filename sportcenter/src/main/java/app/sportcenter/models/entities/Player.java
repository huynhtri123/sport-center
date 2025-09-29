package app.sportcenter.models.entities;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class Player {
    private String name;        // tên cầu thủ
    private String position;    // vị trí (optional)
    private Integer number;     // số áo (optional)
}
