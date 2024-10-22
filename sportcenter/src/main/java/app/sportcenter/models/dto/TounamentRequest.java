package app.sportcenter.models.dto;

import app.sportcenter.models.entities.Prize;
import app.sportcenter.models.entities.Sport;
import app.sportcenter.models.entities.Team;
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
public class TounamentRequest extends BaseRequestDTO {
    @NotBlank(message = "Tên giải đấu không được để trống!")
    private String tounamentName;
    @NotNull(message = "Môn thể thao không được để trống!")
    private Sport sport;
    private ZonedDateTime startDate;
    private ZonedDateTime endDate;
    private Integer maxTeams;
    private List<Team> teams; // danh sách các đội tham gia
    private ZonedDateTime registrationDeadline;
    private List<Prize> prizes; // danh sách giải thưởng
}

