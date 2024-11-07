package app.sportcenter.models.entities;

import app.sportcenter.commons.CourseSportType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.ZonedDateTime;
import java.util.List;

@Document(collection = "Course")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Course extends BaseEntity {
    @Id
    private String id;
    private String courseName;
    private Double tuition;               // học phí
    private String description;
    private String imageUrl;

    private List<Lesson> lessons;

}
