package app.sportcenter.models.entities;

import app.sportcenter.commons.PricedItem;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.ZonedDateTime;

@Document(collection = "Enrollment")
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Enrollment extends BaseEntity implements PricedItem {
    @Id
    private String id;
    private User user;                      // học viên
    private Course course;                  // khoá học

    @Override
    public Double getPrice() {
        return this.course.getTuitition();
    }
}
