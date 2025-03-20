package app.sportcenter.models.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.ZonedDateTime;
import java.util.List;

// quản lý trạng thái sân theo ngày
@Document(collection = "field_status")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class FieldStatusByDate extends BaseEntity {
    @Id
    private String id;

    @Indexed
    private String fieldId;

    @Indexed
    private ZonedDateTime date;

    @Indexed
    private List<TimeSlot> timeSlots;
}
