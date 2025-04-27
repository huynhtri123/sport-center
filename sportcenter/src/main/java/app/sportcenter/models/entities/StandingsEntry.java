package app.sportcenter.models.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StandingsEntry {
    private String teamId;
    private int played = 0;         // số trận đã chơi
    private int won = 0;
    private int lost = 0;
    private int goalsFor = 0;       // tổng bàn ghi được
    private int goalsAgainst = 0;   // tổng bàn thua nhận
    private int points = 0;         // thắng +3, thua +0
}
