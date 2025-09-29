package app.sportcenter.models.dto.request;

import app.sportcenter.models.entities.Player;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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

    @NotBlank(message = "Team name is required!")
    @Size(min = 1, max = 100, message = "Team name must be between {min} and {max} characters long.")
    private String teamName;

    private List<Player> players;

    private String teamLogoUrl;
}