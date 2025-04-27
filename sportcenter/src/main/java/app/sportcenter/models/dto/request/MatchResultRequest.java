package app.sportcenter.models.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchResultRequest {
    private String matchId;
    private int scoreA;
    private int scoreB;
}
