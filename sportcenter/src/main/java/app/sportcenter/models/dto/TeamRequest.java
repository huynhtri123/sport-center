package app.sportcenter.models.dto;

import app.sportcenter.models.entities.Player;
import app.sportcenter.models.entities.Prize;
import app.sportcenter.models.entities.Tounament;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class TeamRequest extends BaseRequestDTO {
    @NotBlank(message = "Bạn chưa nhập tên cho đội!")
    private String teamName;
    private List<Player> players;               // danh sách Player ID
    private Player captain;                     // Player đội trưởng
    private String teamLogoUrl;                   // link logo đội
    private List<Tounament> enrolledTournaments; // danh sách giải đấu trực tiếp
    private List<Prize> wonPrizeIds;             // danh sách Prize ID
}
