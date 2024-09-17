package app.sportcenter.models.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.ZonedDateTime;

@Document(collection = "Match")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Match extends BaseEntity {
    @Id
    private String id;
    private Tounament tounament;
    private Team teamA;
    private Team teamB;
    private ZonedDateTime matchDate;
    private Field field;
    private Team winner;
}
