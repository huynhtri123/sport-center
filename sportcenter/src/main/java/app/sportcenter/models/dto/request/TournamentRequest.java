package app.sportcenter.models.dto.request;

import app.sportcenter.models.entities.Prize;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.time.ZonedDateTime;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class TournamentRequest extends BaseRequestDTO {
    @NotBlank(message = "Sport is required.")
    private String sportId;

    @NotBlank(message = "Tournament name is required.")
    private String tournamentName;

    @NotNull(message = "Tournament start date is required.")
//    @Future(message = "Start date must be in the future")
    private ZonedDateTime startDate;

//    @NotNull(message = "Tournament end date is required.")
////    @Future(message = "End date must be in the future")
//    private ZonedDateTime endDate;

    @NotNull(message = "Maximum number of teams is required.")
    private Integer maxTeams;

//    private List<String> registeredTeamIds;

    @NotNull(message = "Registration deadline is required.")
//    @Future(message = "Registration deadline must be in the future")
    private ZonedDateTime registrationDeadline;

    private List<Prize> prizes;

    private String thumUrl;

    @NotNull(message = "Registration fee is required.")
    private Double registrationFee;                                 // Tournament registration fee

    private List<String> rules;                                     // Tournament rules list
}
