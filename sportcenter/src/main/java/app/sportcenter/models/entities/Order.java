package app.sportcenter.models.entities;

import app.sportcenter.commons.OrderStatus;
import app.sportcenter.commons.PricedItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "Order")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Order extends BaseEntity implements PricedItem {
    @Id
    private String id;
    private User user;                     // chủ nhân đơn hàng
    private List<LineItem> lineItems;
    private OrderStatus status;

    @Override
    public Double getPrice() {
        return this.lineItems.stream()
                .mapToDouble(PricedItem::getPrice)
                .sum();
    }
}
