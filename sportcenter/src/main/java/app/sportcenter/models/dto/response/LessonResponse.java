package app.sportcenter.models.dto.response;


import app.sportcenter.commons.LevelLesson;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class LessonResponse extends BaseResponseDTO {
    private String id;
    private String lessonName;
    private String description;
    private LevelLesson levelLesson;
    private String videoId;
}
