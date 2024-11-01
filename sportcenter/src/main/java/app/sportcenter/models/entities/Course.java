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

    @DBRef
    private List<Lesson> lessons;
//    private Sport sport;                    // môn thể thao được dạy
//    private User coach;                     // huấn luyện viên đảm nhiệm lớp
//    private Integer maxParticipants;
//    private Integer currentParticipants;
//    private String schedule;                // lịch học
//    private ZonedDateTime startDate;
//    private ZonedDateTime endDate;
}
