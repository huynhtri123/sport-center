package app.sportcenter.models.entities;

import app.sportcenter.commons.FieldStatus;
import app.sportcenter.commons.FieldType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "Field")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Field extends BaseEntity {
    @Id
    private String id;
    private FieldType fieldType;
    private FieldStatus fieldStatus;
    private String fieldName;
    private String description;
    private Double price;
    private String imageUrl;
}
