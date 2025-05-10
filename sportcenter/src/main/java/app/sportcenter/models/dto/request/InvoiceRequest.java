package app.sportcenter.models.dto.request;

import app.sportcenter.commons.PaymentMethod;
import app.sportcenter.commons.PaymentStatus;
import app.sportcenter.commons.TransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class InvoiceRequest extends BaseRequestDTO {

    @NotBlank(message = "User ID for the invoice is required.")
    private String userId;

    @NotNull(message = "Invoice amount is required.")
    @Min(value = 0, message = "Invoice amount must be a non-negative number.")
    private Double amount;

    @NotNull(message = "Payment status is required.")
    private PaymentStatus paymentStatus;

    @NotNull(message = "Payment method is required.")
    private PaymentMethod paymentMethod;

    @NotNull(message = "Transaction type is required.")
    private TransactionType transactionType;
}

