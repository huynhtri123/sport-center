package app.sportcenter.models.entities;

import app.sportcenter.commons.PaymentStatus;
import app.sportcenter.commons.PricedItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "Invoice")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Invoice extends BaseEntity {
    @Id
    private String id;
    private User user;
    private Double totalPrice;
    private PaymentStatus paymentStatus;
    private List<PricedItem> items;                 // Các items được thanh toán, có thể là Booking, Order,...

    public Double calculateTotalPrice() {
        if (items == null) {
            return 0.0;
        }
        return items.stream()
                .mapToDouble(PricedItem::getPrice)
                .sum();
    }
}
