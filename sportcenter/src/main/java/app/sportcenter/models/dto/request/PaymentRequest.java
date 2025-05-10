package app.sportcenter.models.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    @NotBlank(message = "Bank name is required.")
    private String bankName;

    @NotBlank(message = "Card number is required.")
    private String cardNumber;

    @NotBlank(message = "Cardholder name is required.")
    private String cardHolderName;

    private ZonedDateTime issueDate;

    @NotBlank(message = "User ID is required.")
    private String userId;
}

