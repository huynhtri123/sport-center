package app.sportcenter.models.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TournamentRegisterRequest {
    @NotBlank(message = "Tournament ID is required.")
    private String tournamentId;

    @NotNull(message = "Team information is required.")
    @Valid
    private TeamRequest teamRequest;
}
