package app.sportcenter.models.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class CourseResponse extends BaseResponseDTO {
    private String id;
    private String sportId;
    private String courseName;
    private Double tuition;
    private String description;
    private String imageUrl;
    private List<LessonResponse> lessons;
}
