package app.sportcenter.models.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnregisterTournamentRequest {
    @NotBlank(message = "Tournament ID is required.")
    private String tournamentId;

    @NotBlank(message = "Team ID is required.")
    private String teamId;
}

