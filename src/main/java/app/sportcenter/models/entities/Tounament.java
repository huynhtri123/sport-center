package app.sportcenter.models.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.ZonedDateTime;
import java.util.List;

@Document(collection = "Tounament")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Tounament extends BaseEntity {
    @Id
    private String id;
    private Sport sport;
    private String tounamentName;                   // tên giải đấu
    private ZonedDateTime startDate;
    private ZonedDateTime endDate;
    private Integer maxTeams;                       // số lượng đội tham gia tối đa
    private List<Team> teams;                       // danh sách đội đã đăng ký tham gia
    private ZonedDateTime registrationDeadline;     // hạn chót đăng ký tham gia
    private List<Prize> prizes;                     // danh sách giải thưởng cho từng vị trí
}
