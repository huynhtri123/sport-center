package app.sportcenter.models.dto;

import app.sportcenter.models.entities.Player;
import app.sportcenter.models.entities.Prize;
import app.sportcenter.models.entities.Tournament;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class TeamRequest extends BaseRequestDTO {

    @NotBlank(message = "Bạn chưa nhập tên cho đội!")
    private String teamName;

    private List<Player> players;              // nếu có 1 mình mình thì FE chọn gì đó, xong lấy thông tin tạo Player

    private String teamLogoUrl;

    private List<String> enrolledTournamentIds;

    private List<Prize> wonPrizes;
}
