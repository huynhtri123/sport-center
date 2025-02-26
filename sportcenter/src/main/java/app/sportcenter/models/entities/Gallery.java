package app.sportcenter.models.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "galleries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Gallery extends BaseEntity {

    @Id
    private String id;

    private Double order;

    private String url;

    private String batchId;

}