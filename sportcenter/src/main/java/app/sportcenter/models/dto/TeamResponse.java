package app.sportcenter.models.dto;

import app.sportcenter.commons.BaseResponse;
import app.sportcenter.models.entities.Player;
import app.sportcenter.models.entities.Tounament;
import app.sportcenter.models.entities.Prize;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamResponse extends BaseResponse {
    private String teamName;                       // tên đội
    private List<Player> players;                  // danh sách Player trong đội
    private Player captain;                        // đội trưởng
    private String teamLogoUrl;                    // logo đội
    private List<Tounament> enrolledTournaments;  // danh sách giải đấu đã tham gia
    private List<Prize> wonPrizes;                 // danh sách giải thưởng đã giành được
}
