package app.sportcenter.models.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "Scoreboard")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Scoreboard extends BaseEntity {
    @Id
    private String id;
    private Tounament tounament;
    private Team team;
    private Integer points;             // số điểm đang có
    private Integer playedMatchs;       // số trận đã chơi
    private Integer wins;               // số trận thắng
    private Integer draws;              // số trận hoà
    private Integer losseds;            // số trận thua
}
