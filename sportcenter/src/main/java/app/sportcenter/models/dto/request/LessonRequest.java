package app.sportcenter.models.dto.request;

import app.sportcenter.commons.LevelLesson;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class LessonRequest extends BaseRequestDTO {

    @NotNull(message = "Lesson name is required!")
    private String lessonName;

    @NotNull(message = "Lesson description is required!")
    private String description;

    @NotNull(message = "Lesson level is required!")
    private LevelLesson levelLesson;

    @NotNull(message = "Lesson video link is required!")
    private String videoId;
}

