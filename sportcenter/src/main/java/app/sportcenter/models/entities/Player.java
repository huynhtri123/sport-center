package app.sportcenter.models.entities;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("Player")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Player extends BaseEntity {
    @Id
    private String id;
    private String name;        // tên cầu thủ
    private String position;    // vị trí (optional)
    private Integer number;     // số áo (optional)
}
