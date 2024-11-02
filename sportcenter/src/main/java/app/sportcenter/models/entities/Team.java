package app.sportcenter.models.entities;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "Team")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class Team extends BaseEntity {
    @Id
    private String id;
    private String userId;                          // chủ sở hữu (thường dùng người đang đăng nhập hiện tại)
    private String teamName;
    private List<Player> players;                   // danh sách thành viên trong đội
    private String teamLogoUrl;                     // link logo đội
    private List<String> enrolledTournamentIds;     // danh sách ID của các giải đấu đã tham gia
    private List<Prize> wonPrizes;                  // danh sách giải thưởng đã giành được
}
