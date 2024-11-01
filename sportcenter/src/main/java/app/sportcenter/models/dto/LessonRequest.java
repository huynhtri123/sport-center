package app.sportcenter.models.dto;

import app.sportcenter.commons.CourseSportType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class LessonRequest extends BaseRequestDTO{

    @NotNull(message = "Bạn chưa nhập loại khóa học!")
    private CourseSportType courseSportType;

    @NotNull(message = "Bạn chưa nhập tên lớp học!")
    private String lessonName;

    @NotNull(message = "Bạn chưa nhập mô tả lớp học!")
    private String description;


    @NotNull(message = "Bạn chưa nhập link video lớp học!")
    private String videoId;
}
