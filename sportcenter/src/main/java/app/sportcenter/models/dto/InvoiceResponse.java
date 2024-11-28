package app.sportcenter.models.dto;

import app.sportcenter.commons.PaymentMethod;
import app.sportcenter.commons.PaymentStatus;
import app.sportcenter.commons.PricedItem;
import app.sportcenter.commons.TransactionType;
import app.sportcenter.models.entities.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class InvoiceResponse extends BaseResponseDTO {
    private String id;
    private String userEmail;
    private String userFullName;
    private Double totalAmount;
    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private TransactionType transactionType;
//    private List<Object> items;
}
