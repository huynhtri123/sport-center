package app.sportcenter.models.dto.request;

import jakarta.validation.constraints.NotBlank;
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
public class CourseRequest extends BaseRequestDTO {

    @NotBlank(message = "Sport ID for the course is required!")
    private String sportId;

    @NotNull(message = "Course name is required!")
    private String courseName;

    @NotNull(message = "Tuition fee is required!")
    private Double tuition;

    @NotNull(message = "Course description is required!")
    private String description;

    @NotNull(message = "Course video link is required!")
    private String imageUrl;

    private List<LessonRequest> lessons;
}

