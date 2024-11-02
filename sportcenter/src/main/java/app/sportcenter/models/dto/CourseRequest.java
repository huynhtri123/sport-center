package app.sportcenter.models.dto;

import app.sportcenter.models.entities.Lesson;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class CourseRequest extends BaseRequestDTO{

    @NotNull(message = "Bạn chưa nhập tên khóa học!")
    private String courseName;

    @NotNull(message = "Bạn chưa nhập hoc phí!")
    private Double tuition;

    @NotNull(message = "Bạn chưa nhập mô tả lớp học!")
    private String description;

    @NotNull(message = "Bạn chưa nhập link video lớp học!")
    private String imageUrl;


    private List<String> lessonIds;
}
