package app.sportcenter.models.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "tournaments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Tournament extends BaseEntity {
    @Id
    private String id;
    private String sportId;                                         // id môn thể thao
    private String tournamentName;                                  // tên giải đấu
    private ZonedDateTime startDate;
    private ZonedDateTime endDate;
    private Integer maxTeams;                                       // số lượng đội tham gia tối đa
    private List<String> registeredTeamIds = new ArrayList<>();     // danh sách ID của các đội đã đăng ký
    private ZonedDateTime registrationDeadline;                     // hạn chót đăng ký tham gia
    private List<Prize> prizes;                                     // danh sách giải thưởng cho từng vị trí (hạng 1,2,3)
    private String thumUrl;
    private Double registrationFee;                                 // phí tham gia giải đấu
    private List<String> rules = new ArrayList<>();                 // danh sách quy định giải đấu
}
