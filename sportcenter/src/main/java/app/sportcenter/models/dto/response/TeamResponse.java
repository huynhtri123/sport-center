package app.sportcenter.models.dto.response;

import app.sportcenter.models.entities.Player;
import app.sportcenter.models.entities.Tournament;
import app.sportcenter.models.entities.Prize;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class TeamResponse extends BaseResponseDTO {
    private String userId;
    private String teamName;
    private List<Player> players;
    private String teamLogoUrl;
    private List<Tournament> wonTournamentIds;
    private List<Prize> wonPrizes;
}
