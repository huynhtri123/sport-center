package app.sportcenter.models.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TournamentRegisterRequest {
    @NotBlank(message = "Bạn chưa chọn giải đấu")
    private String tournamentId;

    @NotBlank(message = "Bạn chưa chọn đội")
    private String teamId;
}
