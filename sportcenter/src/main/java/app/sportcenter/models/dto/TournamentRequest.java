package app.sportcenter.models.dto;

import app.sportcenter.models.entities.Prize;
import app.sportcenter.models.entities.Sport;
import app.sportcenter.models.entities.Team;
import jakarta.validation.constraints.Future;
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
    @NotBlank(message = "Bạn chưa chọn môn thể thao")
    private String sportId;

    @NotBlank(message = "Bạn chưa nhập tên giải đấu")
    private String tournamentName;

    @NotNull(message = "Bạn chưa nhập ngày bắt đầu giải đấu")
    @Future(message = "Ngày bắt đầu phải là ngày trong tương lai")
    private ZonedDateTime startDate;

    @NotNull(message = "Bạn chưa nhập ngày kết thúc giải đấu")
    @Future(message = "Ngày kết thúc phải là ngày trong tương lai")
    private ZonedDateTime endDate;

    @NotNull(message = "Bạn chưa nhập số lượng đội tham gia tối đa")
    private Integer maxTeams;

    private List<String> registeredTeamIds;

    @NotNull(message = "Bạn chưa nhập ngày hạn chót đăng ký tham gia giải đấu")
    @Future(message = "Ngày hạn chót phải là ngày trong tương lai")
    private ZonedDateTime registrationDeadline;

    private List<Prize> prizes;

    private String thumUrl;
}

