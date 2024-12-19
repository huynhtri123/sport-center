package app.sportcenter.models.entities;


import app.sportcenter.commons.CourseSportType;
import app.sportcenter.commons.LevelLesson;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "Lesson")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Lesson extends BaseEntity{
    @Id
    private String id;
//    private CourseSportType courseSportType;
    private String lessonName;
    private String description;
    private LevelLesson levelLesson;
    private String videoId;
}
