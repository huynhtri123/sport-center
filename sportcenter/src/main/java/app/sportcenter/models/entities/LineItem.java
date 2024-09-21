package app.sportcenter.models.entities;

import app.sportcenter.commons.PricedItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "LineItem")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class LineItem extends BaseEntity implements PricedItem {
    @Id
    private String id;
    private Product product;
    private Integer quantity;

    @Override
    public Double getPrice() {
        return this.product.getPrice() * this.quantity;
    }
}
