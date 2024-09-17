package app.sportcenter.models.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "Team")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Team extends BaseEntity {
    @Id
    private String id;
    private String teamName;
    private List<Player> players;                   // danh sách thành viên trong đội
    private Player captain;                         // đội trưởng
    private String teamLogoUrl;                     // link logo đội
    private List<Tounament> EnrolledTounaments;     // danh sách giải đấu đã tham gia
    private List<Prize> wonPrizes;                  // danh sách giải thưởng đã giành được
}
