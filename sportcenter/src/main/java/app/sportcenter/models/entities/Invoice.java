package app.sportcenter.models.entities;

import app.sportcenter.commons.PaymentMethod;
import app.sportcenter.commons.PaymentStatus;
import app.sportcenter.commons.PricedItem;
import app.sportcenter.commons.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Invoice extends BaseEntity {
    @Id
    private String id;
    private User user;
    private Double amount;                     // tổng số tiền của hoá đơn
    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private TransactionType transactionType;
//    private List<Object> items;                 // Các items được thanh toán, có thể là Booking, Order,...
}