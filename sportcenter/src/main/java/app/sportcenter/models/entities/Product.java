package app.sportcenter.models.entities;

import app.sportcenter.commons.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "Product")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Product extends BaseEntity {
    @Id
    private String id;
    private String productName;
    private String description;
    private Double price;
    private Integer stockQuantity;
    private ProductStatus status;
}
