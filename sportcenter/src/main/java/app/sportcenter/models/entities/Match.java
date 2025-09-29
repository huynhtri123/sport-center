package app.sportcenter.models.entities;

import app.sportcenter.commons.MatchStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.ZonedDateTime;

@Document(collection = "matches")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false)
public class Match extends BaseEntity {
    @Id
    private String id;

    private String tournamentId;

    private String teamAId;
    private String teamBId;

    private int scoreA; // null nếu chưa có kết quả
    private int scoreB;

    private ZonedDateTime startTime;
    private ZonedDateTime endTime;

    private Integer round;  // vong

    private MatchStatus status; // UPCOMING, ONGOING, COMPLETED, CANCELED
    private String winnerId;
}

