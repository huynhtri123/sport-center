package app.sportcenter.models.dto.request;

import app.sportcenter.commons.TransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class VNPayRequest extends BaseRequestDTO {
    @NotBlank(message = "User ID for the payment request is required.")
    private String userId;

    @NotNull(message = "Payment amount is required.")
    @Min(value = 0, message = "Payment amount must be a non-negative number.")
    private Double amount;

    // In case of payment by balance
    @Min(value = 0, message = "Payment amount by balance must be a non-negative number.")
    private Double amountByBalance = 0.0;

    @NotNull(message = "Transaction type is required.")
    private TransactionType transactionType;

    private String bookingId;

    private String registerOrderId;
}
