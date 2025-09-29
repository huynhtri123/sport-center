package app.sportcenter.models.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Notification extends BaseEntity {
    @Id
    private String id;
    private String title;       // tiêu đề thông báo
    private String content;     // nội dung thông báo
    private String imageUrl;    // đường dẫn hình ảnh thông báo
}
